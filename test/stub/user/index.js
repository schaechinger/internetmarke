const response = {
  getCredentials: {
    username: 'USER',
    password: 'PASS_#123'
  }
};

const user = {};
user.getCredentials = sinon.stub().returns(response.getCredentials);
user.setToken = sinon.stub().returns(user);
user.setBalance = sinon.stub().returns(user);
user.setTerms = sinon.stub().returns(user);
user.setInfoMessage = sinon.stub().returns(user);

module.exports = {
  user,
  response
};
