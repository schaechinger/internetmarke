const ProductService = require('../../lib/Service/SoapProductService');

const USER_STUB = require('../stub/user');

describe.only('SOAP Product Service', () => {
  it('should load the product list', (done) => {
    const service = new ProductService({ user: USER_STUB.user });

    service.getProductList()
      .then(() => {
        done();
      });
  });
});
