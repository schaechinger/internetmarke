const User = require('../../../lib/User');

const response = {
  getCredentials: {
    username: 'USER',
    password: 'PASS_#123'
  }
};

const user = new User(response.getCredentials);
user.getCredentials = sinon.stub().returns(response.getCredentials);
user.setTerms = sinon.stub().returns(user);
user.setInfoMessage = sinon.stub().returns(user);

module.exports = {
  user,
  response
};
