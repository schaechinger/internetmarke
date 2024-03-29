import { inject, injectable } from 'inversify';
import { WSSecurity } from 'soap';

import { TYPES } from '../di/types';
import { DataStore } from '../services/DataStore';
import { SoapService } from '../services/Soap';
import { Catalog, parseCatalog } from './catalog';
import { Client, ClientCredentials } from './Client';
import { formatDate } from './date';
import { ClientError } from './Error';
import { parseSalesProduct, Product } from './product';

export interface ProductServiceOptions {
  /**
   * The client credentials of your ProdWS account to connect to product
   * service.
   */
  client: ClientCredentials;
  /**
   * The number of seconds the product list cache should be valid. Default is
   * seven days.
   */
  ttl?: number;
}

export interface ProdWS {
  getCatalogList(): Promise<Catalog[]>;
  getCatalog(name: string): Promise<Catalog | null>;
  getProductList(date?: Date): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
}

export const WSDL = 'https://prodws.deutschepost.de:8443/ProdWSProvider_1_1/prodws?wsdl';

/**
 * The implementation of the ProdWS service that handles product information
 */
@injectable()
export class ProductService extends SoapService implements ProdWS {
  protected wsdl = WSDL;

  constructor(
    @inject(TYPES.Client) private client: Client,
    @inject(TYPES.CatalogStore) private catalogStore: DataStore<Catalog>,
    @inject(TYPES.ProductStore) private productStore: DataStore<Product>,
    @inject(TYPES.LoggerFactory) getLogger: any,
    @inject(TYPES.SoapClientFactory) getSoapClient: any
  ) {
    super(getSoapClient);

    this.log = getLogger('prodws');
  }

  /**
   * Initializes the product service and makes it ready to use with the
   * registered client account.
   *
   * @param options Product service options to manipulate the default behaviour.
   */
  public async init(options: ProductServiceOptions): Promise<void> {
    if (!options.client) {
      throw new ClientError('Missing client credentials for ProdWS service init.');
    }

    const ttl = undefined !== options.ttl ? options.ttl : 7 * 24 * 3600;

    this.client.setCredentials(options.client);

    await this.checkSoapClient();

    await this.catalogStore.init('catalog-list.json', this.updateCatalogs.bind(this), ttl);
    await this.productStore.init('product-list.json', this.updateProducts.bind(this), ttl);
  }

  /**
   * Retrieves the list of available catalogs from the service.
   */
  public async getCatalogList(): Promise<Catalog[]> {
    await this.checkServiceInit('Cannot get catalog list before initializing product service');

    return this.catalogStore.getList();
  }

  /**
   * Retrieves the catalog with the given name if existing.
   *
   * @param id The name of the catalog that should be retrieved.
   */
  public async getCatalog(name: string): Promise<Catalog | null> {
    await this.checkServiceInit('Cannot get catalog before initializing product service');

    return this.catalogStore.getItem(name);
  }

  /**
   * Retrieves the list of available products from the service.
   *
   * @param date An optional date that loads the product list at the given date.
   */
  public async getProductList(date?: Date): Promise<Product[]> {
    await this.checkServiceInit('Cannot get product list before initializing product service');

    // only use cache for the latest product data
    if (!date) {
      return this.productStore.getList();
    }

    return this.updateProducts(date).then(products => Object.values(products));
  }

  /**
   * Retrieves the product with the given id if existing.
   *
   * @param id The id of the product that should be retrieved.
   */
  public async getProduct(id: number): Promise<Product | null> {
    await this.checkServiceInit('Cannot get product before initializing product service');

    return this.productStore.getItem(id);
  }

  protected initSoapClient(): void {
    const options = {
      hasTimeStamp: false,
      hasTokenCreated: false
    };

    const security = new WSSecurity(this.client.getUsername(), this.client.getPassword(), options);

    this.soapClient.setSecurity(security);
  }

  private async updateCatalogs(): Promise<{ [id: number]: any }> {
    const payload: any = {
      mandantID: this.client.getId()
    };

    // pay.load.subMandatId

    payload.catalogProperties = true;

    return this.soapClient
      .getCatalogListAsync(payload)
      .then(([response]: any) => {
        if (!response || 'true' !== response.attributes.success) {
          return {};
        }

        const catalogs: { [id: number]: Catalog } = {};

        response.Response.catalogList.catalog.forEach((data: any) => {
          const catalog = parseCatalog(data);

          if (catalog) {
            catalogs[catalog.id] = catalog;
          }
        });

        return catalogs;
      })
      .catch((e: any) => {
        this.log('getCatalogList', e.root?.Envelope.Body.Fault || e);
        // throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });
  }

  private async updateProducts(date?: Date): Promise<{ [id: number]: Product }> {
    const payload: any = {
      mandantID: this.client.getId()
    };

    if (date) {
      payload.timestamp = {
        attributes: formatDate(date)
      };
    }

    payload.dedicatedProducts = true;
    payload.responseMode = 0;

    return this.soapClient
      .getProductListAsync(payload)
      .then(([response]: any) => {
        if (!response || 'true' !== response.attributes.success) {
          return {};
        }

        const products: { [id: number]: Product } = {};

        response.Response.salesProductList.SalesProduct.forEach((data: any) => {
          const product = parseSalesProduct(data);

          if (product) {
            products[product.id] = product;
          }
        });

        return products;
      })
      .catch((e: any) => {
        this.log('getProductList', e.root?.Envelope.Body.Fault || e);
        // throw new SoapError(e.root.Envelope.Body.Fault.faultstring);
      });
  }
}
