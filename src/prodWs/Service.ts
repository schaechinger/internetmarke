// import { Debugger } from "debug";
import { WSSecurity } from "soap";
import { DataStore } from "../services/DataStore";
import { SoapService } from "../services/Soap";
import { Client, ClientCredentials } from "./Client";
import { formatProducts, Product } from "./product";

export interface ProductServiceOptions {
  /** The client credentials to connect to product service. */
  client: ClientCredentials;
  /** Number of seconds the product list cache should be valid. Default is seven days. */
  ttl?: number;
}

export interface ProdWS {
  getProductList(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
}

const WSDL =
  "https://prodws.deutschepost.de:8443/ProdWSProvider_1_1/prodws?wsdl";

export class ProductService extends SoapService implements ProdWS {
  protected wsdl = WSDL;
  private client: Client;
  private productStore: DataStore<Product>;
  // private log: Debugger;

  constructor(clientCredentials: ClientCredentials) {
    super();

    this.client = new Client(clientCredentials);
    this.productStore = new DataStore<Product>();
    // this.log = getLogger("prodws");
  }

  public async init(options: ProductServiceOptions): Promise<void> {
    await this.checkSoapClient();

    await this.productStore.init(
      "product-list.json",
      this.updateProducts.bind(this),
      options.ttl || 7 * 24 * 3600
    );
  }

  public getProductList(): Promise<Product[]> {
    return this.productStore.getList();
  }

  public getProduct(id: number): Promise<Product | null> {
    return this.productStore.getItem(id);
  }

  private async updateProducts(): Promise<{ [id: number]: Product }> {
    return this.soapClient
      .getProductListAsync({
        mandantID: this.client.getId(),
        dedicatedProducts: true,
        responseMode: 0,
      })
      .then(([response]: any) => {
        console.log(response);

        if (!response || "true" !== response.attributes.success) {
          return {};
        }

        return formatProducts(response.Response);
      });
  }

  protected initSoapClient(): void {
    const options = {
      hasTimeStamp: false,
      hasTokenCreated: false,
    };

    const security = new WSSecurity(
      this.client.getUsername(),
      this.client.getPassword(),
      options
    );

    this.soapClient.setSecurity(security);
  }
}
