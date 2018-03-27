const ProductService = require('../../../lib/Service/Soap/Product');

const CLIENT_STUB = require('../../stub/client');

xdescribe('SOAP Product Service', () => {
  it('should load the product list', (done) => {
    const service = new ProductService({ client: CLIENT_STUB.client, forceLoad: false });

    service.getProductList()
      .then(() => {
        done();
      });
  });
});
