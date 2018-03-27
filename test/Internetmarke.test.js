const Internetmarke = require('../'),
  errors = require('../lib/errors'),
  { LAYOUT_ZONES } = require('../lib/constants');

const CLIENT_STUB = require('./stub/client'),
  PARTNER_STUB = require('./stub/partner'),
  USER_STUB = require('./stub/user'),
  reset = require('./stub/reset');

describe('Internetmarke', () => {
  const SERVICE_1C4A_STUB = {
    authenticateUser: sinon.stub().returns(Promise.resolve(true)),
    checkout: sinon.stub().returns(Promise.resolve()),
    previewVoucher: sinon.stub().returns(Promise.resolve()),
    retrieveOrder: sinon.stub().returns(Promise.resolve())
  };
  const PRODUCT_LIST_STUB = {
    getProduct: sinon.stub().returns(false),
    matchProduct: sinon.stub().returns(false)
  };
  const ORDER_STUB = {
    addPosition: sinon.stub(),
    getCheckout: sinon.stub().returns({ total: 145 })
  };

  /** @type {Internetmarke} */
  let internetmarke = null;

  beforeEach(() => {
    internetmarke = new Internetmarke(PARTNER_STUB.partner);
    internetmarke._1C4AService = SERVICE_1C4A_STUB;
    internetmarke._order = ORDER_STUB;
  });

  afterEach(() => {
    reset(PARTNER_STUB.partner);
    reset(USER_STUB.user);
    reset(SERVICE_1C4A_STUB);
    reset(ORDER_STUB);
    reset(PRODUCT_LIST_STUB);
  });

  describe('1C4A', () => {
    it('should call service for user authentication', done => {
      internetmarke.authenticateUser(USER_STUB.user)
        .then(() => {
          SERVICE_1C4A_STUB.authenticateUser.calledOnce.should.be.true();
          
          done();
        });
    });

    it('should call service for voucher preview', done => {
      internetmarke.getVoucherPreview({})
        .then(() => {
          SERVICE_1C4A_STUB.previewVoucher.calledOnce.should.be.true();

          done();
        });
    });

    describe('Order Management', () => {
      it('should add a voucher to the order', () => {
        const VOUCHER = {
          productCode: 1,
          price: 70,
          voucherLayout: LAYOUT_ZONES.FRANKING
        };

        internetmarke.orderVoucher(VOUCHER);
        ORDER_STUB.addPosition.calledOnce.should.be.true();
        ORDER_STUB.addPosition.args[0][0].should.containEql(VOUCHER);
      });

      it('should not checkout if wallet is empty', () => {
        internetmarke.authenticateUser(USER_STUB.user);
        (() => {
          internetmarke.checkout();
        }).should.throw(errors.internetmarke.walletEmpty);
      });

      it('should call service for checkout', done => {
        const getBalance = USER_STUB.user.getBalance;
        USER_STUB.user.getBalance = sinon.stub().returns(1000000);

        internetmarke.authenticateUser(USER_STUB.user);
        internetmarke.checkout()
          .then(() => {
            SERVICE_1C4A_STUB.checkout.calledOnce.should.be.true();

            USER_STUB.user.getBalance = getBalance;
            done();
          });
      });

      it('should retrieve an existing order', done => {
        internetmarke.retrieveOrder({ orderid: 1 })
          .then(order => {
            SERVICE_1C4A_STUB.retrieveOrder.calledOnce.should.be.true();

            done();
          });
      });
    });
  });

  describe('Prod WS', () => {
    describe('enableProductList', () => {
      xit('should enable the product list', done => {
        internetmarke.enableProductList({ client: CLIENT_STUB.client })
          .then(success => {
            internetmarke._productList.should.be.ok();
            
            success.should.be.true();

            done();
          });
      });

      it('should not overwrite an existing product list', done => {
        const fakeList = { FAKE_PRODUCT_LIST: true };
        internetmarke._productList = fakeList;

        internetmarke.enableProductList({ client: CLIENT_STUB.client })
          .then(success => {
            internetmarke._productList.should.equal(fakeList);
            success.should.be.true();

            done();
          });
      });
    });

    describe('getProductList', () => {
      it('should ', done => {
        internetmarke._checkProductList = sinon.stub().returns(true);
        const fakeList = [ 1, 2, 3 ];
        internetmarke._productList = {
          _products: fakeList
        };

        internetmarke.getProductList()
          .then(productList => {
            internetmarke._checkProductList.calledOnce.should.be.true();
            productList.should.equal(fakeList);

            done();
          });
      });
    });

    describe('findProduct', () => {
      const parameters = { id: 1 };

      it('should require an enabled product list', () => {
        (() => {
          internetmarke.findProduct(parameters);
        }).should.throw(errors.usage.missingProductClient);
      });

      it('should search product by id', done => {
        internetmarke._productList = PRODUCT_LIST_STUB;

        internetmarke.findProduct(parameters)
          .then(product => {
            product.should.be.false();
            PRODUCT_LIST_STUB.getProduct.calledOnce.should.be.true();
            PRODUCT_LIST_STUB.matchProduct.calledOnce.should.be.false();

            done();
          });
      });

      it('should try to match product without id', done => {
        internetmarke._productList = PRODUCT_LIST_STUB;

        internetmarke.findProduct({})
          .then(product => {
            product.should.be.false();
            PRODUCT_LIST_STUB.getProduct.calledOnce.should.be.false();
            PRODUCT_LIST_STUB.matchProduct.calledOnce.should.be.true();

            done();
          });
      });
    });
  });

  it('should validate voucher layouts', () => {
    internetmarke.setDefaultVoucherLayout(LAYOUT_ZONES.FRANKING)
      .should.be.true();
    internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);

    internetmarke.setDefaultVoucherLayout('INVALID_ZONE')
      .should.be.false();
    internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);
  });
});
