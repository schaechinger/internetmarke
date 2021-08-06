import { expect } from 'chai';
import soapStub from 'soap/soap-stub';
import { ProductService, WSDL } from '../../src/prodWs/Service';
import { clientCredentials } from './helper';
import { prodWsStub } from './Service.stub';

describe('ProdWS Service', () => {
  let service: ProductService;

  beforeEach(async () => {
    service = new ProductService(clientCredentials);
  });

  it('should initialize the product service without data', () => {
    service = new ProductService(clientCredentials);

    service.init({ client: clientCredentials });
  });

  it('should load product list', () => {
    service.init({ client: clientCredentials });

    soapStub.registerClient('prodWsStub', WSDL, prodWsStub);

    const products = service.getProductList();

    expect(products).to.exist;
  });
});
