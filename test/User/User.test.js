const User = require('../../lib/User'),
  errors = require('../../lib/errors');

const TEST_DATA = require('./User.data.json');

describe('User', () => {
  it('should insist in credentials', () => {
    (() => {
      TEST_DATA.invalid.forEach((creds) => {
        const user = new User(creds);
      });
    }).should.throw(errors.usage.missingUserCredentials);
  });

  it('should store the credentials', () => {
    const user = new User(TEST_DATA.credentials);

    const cred = user.getCredentials();
    cred.should.eql(TEST_DATA.credentials);
    
    cred.password = 'MOD_PASS';
    cred.username = 'MOD_USER';
    user.getCredentials().should.eql(TEST_DATA.credentials);
  });

  it('should add order ids to the user', () => {
    const user = new User(TEST_DATA.credentials);

    should.not.exist(user.getOrderId());
    user.addOrderId(TEST_DATA.orderIds[0]);
    user.getOrderId().should.equal(TEST_DATA.orderIds[0]);
    user._orderIds.should.have.length(1);

    user.addOrderId(TEST_DATA.orderIds[1]);
    user.getOrderId().should.equal(TEST_DATA.orderIds[1]);
    user._orderIds.should.have.length(2);
    user._orderIds.should.containDeep(TEST_DATA.orderIds);
  });

  it('should tell if the user is authenticated', () => {
    const TOKEN = 'USER_TOKEN';

    const user = new User(TEST_DATA.credentials);
    user.isAuthenticated().should.be.false();
    should.not.exist(user.getToken());

    user.setToken(TOKEN);
    user.isAuthenticated().should.be.true();
    user.getToken().should.equal(TOKEN);
  });
});
