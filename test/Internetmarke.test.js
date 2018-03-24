const Internetmarke = require('../'),
  errors = require('../lib/errors'),
  { LAYOUT_ZONES } = require('../lib/constants');

const PARTNER_STUB = require('./stub/partner'),
  USER_STUB = require('./stub/user'),
  reset = require('./stub/reset');

describe('Internetmarke', () => {
  const SERVICE_STUB = {
    authenticateUser: sinon.stub().returns(Promise.resolve(true)),
    checkout: sinon.stub().returns(Promise.resolve()),
    previewVoucher: sinon.stub().returns(Promise.resolve())
  };
  const ORDER_STUB = {
    addPosition: sinon.stub(),
    getCheckout: sinon.stub().returns({ total: 145 })
  };

  /** @type {Internetmarke} */
  let internetmarke = null;

  beforeEach(() => {
    internetmarke = new Internetmarke(PARTNER_STUB.partner);
    internetmarke._1C4AService = SERVICE_STUB;
    internetmarke._order = ORDER_STUB;
  });

  afterEach(() => {
    reset(PARTNER_STUB.partner);
    reset(USER_STUB.user);
    reset(SERVICE_STUB);
    reset(ORDER_STUB);
  });

  describe('1C4A', () => {
    it('should call service for user authentication', done => {
      internetmarke.authenticateUser(USER_STUB.user)
        .then(() => {
          SERVICE_STUB.authenticateUser.calledOnce.should.be.true();
          
          done();
        });
    });

    it('should call service for voucher preview', done => {
      internetmarke.getVoucherPreview({})
        .then(() => {
          SERVICE_STUB.previewVoucher.calledOnce.should.be.true();

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
            SERVICE_STUB.checkout.calledOnce.should.be.true();

            USER_STUB.user.getBalance = getBalance;
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
