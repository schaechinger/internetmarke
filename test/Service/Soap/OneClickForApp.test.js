const OneClickForAppService = require('../../../lib/Service/Soap/OneClickForApp'),
  CLIENT_STUB = require('../../stub/soapClient'),
  PARTNER_STUB = require('../../stub/partner'),
  USER_STUB = require('../../stub/user'),
  { WSDL, LAYOUT_ZONES, OUTPUT_FORMATS } = require('../../../lib/constants'),
  reset = require('../../stub/reset');


/** @type {OneClickForAppService} */
let service = null;

describe('1C4A Service', () => {
  beforeEach(() => {
    service = new OneClickForAppService({ partner: PARTNER_STUB.partner });
    service._getSoapClient = sinon.stub().returns(
      Promise.resolve(CLIENT_STUB.client)
    );
    service._user = USER_STUB.user;
  });

  afterEach(() => {
    reset(CLIENT_STUB.client);
    reset(PARTNER_STUB.partner);
    reset(USER_STUB.user);
  });

  describe('authenticateUser', () => {
    it('should save user data after authentication', done => {
      service.authenticateUser(USER_STUB.user)
        .then(success => {
          success.should.be.true();
          CLIENT_STUB.client.authenticateUserAsync.calledOnce.should.be.true();

          const response = CLIENT_STUB.response.authenticateUserAsync;
          USER_STUB.user.getCredentials.calledOnce.should.be.true();
          USER_STUB.user.getToken().should.equal(response.userToken);
          USER_STUB.user.getBalance().should.equal(response.walletBalance);
          USER_STUB.user.getTerms().should.equal(response.showTermAndCondition);
          should.not.exist(USER_STUB.user.getInfoMessage());

          done();
        });
    });
  });

  describe('previewVoucher', () => {
    it('should call the PNG method', done => {
      service.previewVoucher({
        productCode: 1,
        voucherLayout: LAYOUT_ZONES.ADDRESS,
        outputFormat: OUTPUT_FORMATS.PNG
      })
        .then(result => {
          result.should.be.an.Object().and.have.property('link');
          result.should.containEql(CLIENT_STUB.response.retrievePreviewVoucherPNGAsync);

          done();
        });
    });
  });

  describe('checkout', () => {
    it('should call the PNG checkout', done => {
      const params = {
        order: { ORDER_FAKE_STUB: true },
        outputFormat: OUTPUT_FORMATS.PNG
      };

      service.checkout(params)
        .then(result => {
          CLIENT_STUB.client.checkoutShoppingCartPNGAsync.calledOnce.should.be.true();
          CLIENT_STUB.client.checkoutShoppingCartPNGAsync.args[0][0]
            .should.containDeep(params.order);

          done();
        });
    });

    it('should update user data', done => {
      const order = { ORDER_FAKE_STUB: true };

      service.checkout({
        order,
        outputFormat: OUTPUT_FORMATS.PNG
      })
        .then(result => {
          const response = CLIENT_STUB.response.checkoutShoppingCartPNGAsync;
          USER_STUB.user._balance.should.equal(response.walletBallance);
          result.should.have.properties([ 'orderId', 'link', 'vouchers' ]);

          done();
        });
    });
  });

  describe('generateOrderId', () => {
    it('should generate an order id', done => {
      service.generateOrderId()
        .then(orderId => {
          CLIENT_STUB.client.createShopOrderIdAsync.calledOnce.should.be.true();
          orderId.should.equal(CLIENT_STUB.response.createShopOrderIdAsync.shopOrderId);

          done();
        });
    });
  });

  describe('_initClient', () => {
    it('should set soap headers on init', () => {
      service._initClient(CLIENT_STUB.client);

      PARTNER_STUB.partner.getSoapHeaders.calledOnce.should.be.true();
      CLIENT_STUB.client.addSoapHeader.calledOnce.should.be.true();
    });
  });
});
