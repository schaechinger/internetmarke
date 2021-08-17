import { expect } from 'chai';
import { ProductService } from '../../../src/prodWs/Service';
import { clientStub } from './Client.stub';
import { getLoggerStub } from '../../stubs/logger.stub';
import { clientCredentials } from '../helper';
import { validProducts } from '../product/product.data';
import { getInvalidProdWsStub, getProdWsStub, prodWsStub } from './Soap.stub';
import { DataStore } from '../../../src/services/DataStore';
import { Product } from '../../../src/prodWs/product';
import { ClientError } from '../../../src/prodWs/Error';
import { InternetmarkeMock } from '../../stubs/Internetmarke.mock';
import { Catalog } from '../../../src/prodWs/catalog';

describe('ProdWS Service', () => {
  let service: ProductService;
  const catalogStore = new DataStore<Catalog>(getLoggerStub);
  const productStore = new DataStore<Product>(getLoggerStub);

  beforeEach(async () => {
    prodWsStub.getProductListAsync.resetHistory();
    service = new ProductService(
      clientStub,
      catalogStore,
      productStore,
      getLoggerStub,
      getProdWsStub
    );
  });

  describe('init', () => {
    // test init through public internetmarke api
    let internetmarke: InternetmarkeMock;

    beforeEach(() => {
      internetmarke = new InternetmarkeMock();
    });

    it('should prevent init without client credentials', async () => {
      await expect(internetmarke.initProductService({} as any)).to.eventually.be.rejectedWith(
        ClientError
      );
    });

    xit('should init with minimal options', async () => {
      const myService = await internetmarke.initProductService({ client: clientCredentials });

      expect(myService).to.be.instanceOf(ProductService);
    });
  });

  describe('getProductList', () => {
    it('should load product list', async () => {
      await service.init({ client: clientCredentials, ttl: 0 });

      const products = await service.getProductList();

      expect(products).to.exist;
      expect(products).to.have.length(validProducts.length);
    });

    it('should detect invalid product list response', async () => {
      service = new ProductService(
        clientStub,
        catalogStore,
        productStore,
        getLoggerStub,
        getInvalidProdWsStub
      );

      await service.init({ client: clientCredentials, ttl: 0 });
      const products = await service.getProductList();

      expect(products).to.exist;
      expect(products).to.have.length(0);
    });

    it('should load outdated product list without cache', async () => {
      await service.init({ client: clientCredentials, ttl: 3600 });

      const products = await service.getProductList(new Date('2018-02-01'));

      expect(products).to.exist;
      const call = prodWsStub.getProductListAsync.getCall(0);
      const args = call.firstArg;

      expect(args).to.have.property('timestamp');
    });
  });

  describe('getProduct', () => {
    it('should retrieve product by id', async () => {
      await service.init({ client: clientCredentials, ttl: 0 });

      const product = await service.getProduct(1);

      expect(product).to.exist;
      expect(product!.id).to.equal(1);
    });

    it('should detect invalid product id', async () => {
      await service.init({ client: clientCredentials, ttl: 0 });

      const product = await service.getProduct(7);

      expect(product).to.not.exist;
    });
  });
});
