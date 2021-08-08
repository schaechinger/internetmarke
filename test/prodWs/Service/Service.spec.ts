import { expect } from 'chai';
import { ProductService } from '../../../src/prodWs/Service';
import { clientStub } from './Client.stub';
import { getLoggerStub } from '../../stubs/logger.stub';
import { clientCredentials } from '../helper';
import { validProducts } from '../product/product.data';
import { getProdWsStub } from './Service.stub';
import { DataStore } from '../../../src/services/DataStore';
import { Product } from '../../../src/prodWs/product';
import { ClientError } from '../../../src/prodWs/Error';

describe('ProdWS Service', () => {
  let service: ProductService;

  beforeEach(async () => {
    const store = new DataStore<Product>(getLoggerStub);
    service = new ProductService(clientStub, store, getLoggerStub, getProdWsStub);
  });

  it('should prevent init without client credentials', async () => {
    await expect(service.init({} as any)).to.eventually.be.rejectedWith(ClientError);
  });

  it('should load product list', async () => {
    await service.init({ client: clientCredentials, ttl: 0 });

    const products = await service.getProductList();

    expect(products).to.exist;
    expect(products).to.have.length(validProducts.length);
  });
});
