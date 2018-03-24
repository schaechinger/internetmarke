const response = {
  getUsername: 'CLIENT_USER',
  getPassword: 'CLIENT_PASS',
  getId: 'MANDANT_ID'
};

const client = {
  getUsername: sinon.stub().returns(response.getUsername),
  getPassword: sinon.stub().returns(response.getPassword),
  getId: sinon.stub().returns(response.getId)
};

module.exports = {
  client,
  response
};
