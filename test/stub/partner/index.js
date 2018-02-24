const response = {
  getSoapHeaders: {
    FAKE_STUB_HEADERS: '11'
  }
};

const partner = {
  getSoapHeaders: sinon.stub().returns(response.getSoapHeaders)
};

module.exports = {
  partner,
  response
};
