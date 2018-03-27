const ProductList = require('../../lib/ProductList');

const TEST_DATA = require('./ProductList.data.json');

describe('ProductList', () => {
  describe('init', () => {
    const productList = new ProductList({ client: {} });

    productList.loadProducts = sinon.stub().returns(Promise.resolve('LOADING'));

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
        get: sinon.stub().returns(Promise.resolve(JSON.stringify(TEST_DATA.empty)))
      };

      productList.init()
        .then(result => {
          productList._temp.get.calledOnce.should.be.true();
          productList.loadProducts.calledOnce.should.be.true();

          result.should.equal('LOADING');

          done();
        });
    });

    it('should take data if available', done => {
      const clock = sinon.useFakeTimers(+new Date(TEST_DATA.empty.date + ' 05:00:00'));
      
      productList._temp = {
        get: sinon.stub().returns(Promise.resolve(JSON.stringify(TEST_DATA.empty)))
      };
      
      productList.init()
      .then(result => {
        productList._temp.get.calledOnce.should.be.true();
        productList.loadProducts.calledOnce.should.be.false();

        result.should.be.true();
        
        clock.restore();
        done();
      });
    });
  });

  describe('parseData', () => {
    const productList = new ProductList({ client: {} });

    beforeEach(() => {
      productList._products = [];
    })

    it('should detect missing data', () => {
      [ null, undefined, '' ].forEach(data => {
        productList._parseData(data).should.be.false();
      });
    });

    it('should add products from data', () => {
      productList._parseData(TEST_DATA.parsableProducts).should.be.true();
      productList._products.should.have.length(4);
    });
  });
});