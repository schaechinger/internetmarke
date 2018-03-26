const ProductList = require('../../lib/ProductList');

describe('ProductList', () => {
  describe('init', () => {
    const productList = new ProductList({ client: {} });

    productList.loadProducts = sinon.stub().returns(Promise.resolve('LOADING'));

    const data = {
      date: '2018-03-01',
      salesProductList: {
        SalesProduct: []
      }
    };

    beforeEach(() => {
      productList.loadProducts.resetHistory();
    });

    it('should trigger load products if data are not available', done => {
      productList._temp = {
        get: sinon.stub().returns(Promise.resolve(''))
      };

      productList.init()
        .then(result => {
          productList._temp.get.calledOnce.should.be.true();
          productList.loadProducts.calledOnce.should.be.true();
          
          result.should.equal('LOADING');

          done();
        });
    });

    it('should load products if data are too old', done => {
      productList._temp = {
        get: sinon.stub().returns(Promise.resolve(JSON.stringify(data)))
      };

      productList.init()
        .then(result => {
          productList._temp.get.calledOnce.should.be.true();
          productList.loadProducts.calledOnce.should.be.true();

          result.should.equal('LOADING');

          done();
        });
    });

    xit('should take data if available', done => {
      // TODO: manipulate date
      productList._temp = {
        get: sinon.stub().returns(Promise.resolve(JSON.stringify(data)))
      };

      productList.init()
        .then(result => {
          productList._temp.get.calledOnce.should.be.true();
          productList.loadProducts.calledOnce.should.be.false();

          done();
        });
    });
  });
});