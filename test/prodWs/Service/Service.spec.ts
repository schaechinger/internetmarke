import { expect } from 'chai';
import { ProductService } from '../../../src/prodWs/Service';
import { clientStub } from './Client.stub';
import { getLoggerStub } from '../../stubs/logger.stub';
import { clientCredentials } from '../helper';
import { validProducts } from '../product/product.data';
import { getProdWsStub, prodWsStub } from './Soap.stub';
import { DataStore } from '../../../src/services/DataStore';
import { Product } from '../../../src/prodWs/product';
import { ClientError } from '../../../src/prodWs/Error';

describe('ProdWS Service', () => {
  let service: ProductService;
  const store = new DataStore<Product>(getLoggerStub);

  beforeEach(async () => {
    prodWsStub.getProductListAsync.resetHistory();
    service = new ProductService(clientStub, store, getLoggerStub, getProdWsStub);
  });

  describe('init', () => {
    it('should prevent init without client credentials', async () => {
      await expect(service.init({} as any)).to.eventually.be.rejectedWith(ClientError);
    });

    it('should init with minimal options', async () => {
      await expect(service.init({ client: clientCredentials })).to.eventually.be.fulfilled;
    });
  });

  describe('getProductList', () => {
    it('should load product list', async () => {
      await service.init({ client: clientCredentials, ttl: 0 });

      const products = await service.getProductList();

      expect(products).to.exist;
      expect(products).to.have.length(validProducts.length);
    });

    it('should load outdated product list without cache', async () => {
      await service.init({ client: clientCredentials, ttl: 3600 });

      const date = ['2018-02-01', '10:00:00.000+00:00'];
      const products = await service.getProductList(new Date(date.join(' ')));

      expect(products).to.exist;
      const call = prodWsStub.getProductListAsync.getCall(0);
      const args = call.firstArg;

      expect(args).to.have.property('timestamp');
      expect(args.timestamp.attributes.date).to.equal(date[0]);
      expect(args.timestamp.attributes.time).to.equal(date[1]);
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
