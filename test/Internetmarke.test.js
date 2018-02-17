const Internetmarke = require('../'),
  errors = require('../lib/errors'),
  { LAYOUT_ZONES } = require('../lib/constants');

describe('Internetmarke', () => {
  const PARTNER = {
    getSoapHeaders: sinon.stub().returns({})
  };

  it('should connect to service', (done) => {
    const internetmarke = new Internetmarke(PARTNER);
    internetmarke._getSoapClient()
      .then(client => {
        client.should.be.an.Object();
        client.should.have.keys(
          'authenticateUserAsync', 'createShopOrderIdAsync',
          'retrievePreviewVoucherPNGAsync', 'retrievePreviewVoucherPDFAsync',
          'checkoutShoppingCartPNGAsync', 'checkoutShoppingCartPDFAsync',
        );

        done();
      });
  }).timeout(10000);

  it('should change to valid voucher layouts', () => {
    const internetmarke = new Internetmarke(PARTNER);

    internetmarke.setDefaultVoucherLayout(LAYOUT_ZONES.FRANKING);
    internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);

    internetmarke.setDefaultVoucherLayout('INVALID_ZONE');
    internetmarke._config.voucherLayout.should.equal(LAYOUT_ZONES.FRANKING);
  });

  it('should save user data after authentication', (done) => {
    const internetmarke = new Internetmarke(PARTNER);
    const user = {};
    user.getCredentials = sinon.stub().returns({ username: 'USER', password: 'PASS_#123' });
    user.setToken = sinon.stub().returns(user);
    user.setBalance = sinon.stub().returns(user);
    user.setTerms = sinon.stub().returns(user);
    user.setInfoMessage = sinon.stub().returns(user);
    const response = {
      userToken: '#12_USER_TOKEN',
      walletBalance: 12300,
      showTermAndCondition: false
    };
    const client = {
      authenticateUserAsync: sinon.stub().returns(Promise.resolve(response))
    };
    internetmarke._getSoapClient = sinon.stub().returns(Promise.resolve(client));
    internetmarke._generateOrderId = sinon.stub().returns(Promise.resolve(1234));

    internetmarke.authenticateUser(user)
      .then(() => {
        user.getCredentials.calledOnce.should.be.true();
        user.setToken.args[0][0].should.equal(response.userToken);
        user.setBalance.args[0][0].should.equal(response.walletBalance);
        user.setTerms.args[0][0].should.equal(response.showTermAndCondition);
        should.not.exist(user.setInfoMessage.args[0][0]);
        done();
      })
      .catch(e => {
        console.log('could not auth user', e);
      });
  });
});
