const User = require('../../lib/User'),
  errors = require('../../lib/errors');

describe.only('User', () => {
  const CREDENTIALS = {
    username: 'user_1',
    password: '#MY_PASS'
  };
  const ORDER_IDS = [ 1234, 2345 ];

  it('should insist in credentials', () => {
    (() => {
      [
        {},
        { username: 'user' },
        { password: 'pass' },
        { user: 'wrongKey' }
      ].forEach((creds) => {
        const user = new User(creds);
      });
    }).should.throw(errors.usage.missingUserCredentials);
  });

  it('should store the credentials', () => {
    const user = new User(CREDENTIALS);

    const cred = user.getCredentials();
    cred.should.eql(CREDENTIALS);
    
    cred.password = 'MOD_PASS';
    cred.username = 'MOD_USER';
    user.getCredentials().should.eql(CREDENTIALS);
  });

  it('should add order ids to the user', () => {
    const user = new User(CREDENTIALS);

    should.not.exist(user.getOrderId());
    user.addOrderId(ORDER_IDS[0]);
    user.getOrderId().should.equal(ORDER_IDS[0]);
    user._orderIds.should.have.length(1);

    user.addOrderId(ORDER_IDS[1]);
    user.getOrderId().should.equal(ORDER_IDS[1]);
    user._orderIds.should.have.length(2);
    user._orderIds.should.containDeep(ORDER_IDS);
  });

  it('should tell if the user is authenticated', () => {
    const user = new User(CREDENTIALS);
    user.isAuthenticated().should.be.false();

    user.setToken('USER_TOKEN');
    user.isAuthenticated().should.be.true();
  });
});
