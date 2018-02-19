const User = require('../../../lib/User');

const response = {
  getCredentials: {
    username: 'USER',
    password: 'PASS_#123'
  }
};

const user = new User(response.getCredentials);
user.getCredentials = sinon.stub().returns(response.getCredentials);

module.exports = {
  user,
  response
};
