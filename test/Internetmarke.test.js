const Internetmarke = require('../'),
  errors = require('../lib/errors'),
  { LAYOUT_ZONES } = require('../lib/constants');

const CLIENT_STUB = require('./stub/soapClient'),
  USER_STUB = require('./stub/user');

describe('Internetmarke', () => {
  const PARTNER = {
    getSoapHeaders: sinon.stub().returns({})
  };

  describe('API Auth', () => {
    it('should connect to service', (done) => {
      const internetmarke = new Internetmarke(PARTNER);
      internetmarke._getSoapClient()
        .then(client => {
          client.should.be.an.Object();
          // TODO: switch to client stub properties
          client.should.have.keys(
            'authenticateUserAsync', 'createShopOrderIdAsync',
            'retrievePreviewVoucherPNGAsync', 'retrievePreviewVoucherPDFAsync',
            'checkoutShoppingCartPNGAsync', 'checkoutShoppingCartPDFAsync'
          );

          done();
        });
    }).timeout(5000);

    it('should save user data after authentication', (done) => {
      const internetmarke = new Internetmarke(PARTNER);
      internetmarke._getSoapClient = sinon.stub().returns(
        Promise.resolve(CLIENT_STUB.client)
      );
      internetmarke._generateOrderId = sinon.stub().returns(Promise.resolve(1234));

      internetmarke.authenticateUser(USER_STUB.user)
        .then(() => {
          const response = CLIENT_STUB.response.authenticateUserAsync;
          USER_STUB.user.getCredentials.calledOnce.should.be.true();
          USER_STUB.user.getToken().should.equal(response.userToken);
          USER_STUB.user.getBalance().should.equal(response.walletBalance);
          USER_STUB.user.setTerms.args[0][0].should.equal(response.showTermAndCondition);
          should.not.exist(USER_STUB.user.setInfoMessage.args[0][0]);
          done();
        })
        .catch(e => {
          should.not.exist(e);
        });
    });
  });

  describe('Order vouchers', () => {
    it('should change to valid voucher layouts', () => {
      const internetmarke = new Internetmarke(PARTNER);

      internetmarke.setDefaultVoucherLayout(LAYOUT_ZONES.FRANKING);
      internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);

      internetmarke.setDefaultVoucherLayout('INVALID_ZONE');
      internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);
    });

    it ('should add a voucher to the order', () => {
      const VOUCHER = {
        productCode: 1,
        price: 70,
        voucherLayout: 'Franking'
      };

      const internetmarke = new Internetmarke(PARTNER);

      const order = {
        addPosition: sinon.stub()
      };
      internetmarke._order = order;

      internetmarke.orderVoucher(VOUCHER);
      order.addPosition.calledOnce.should.be.true();
      order.addPosition.args[0][0].should.containEql(VOUCHER);
    });
  });
});
