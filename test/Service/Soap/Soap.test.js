const SoapService = require('../../../lib/Service/Soap/Soap'),
  CLIENT_STUB = require('../../stub/soapClient'),
  { WSDL } = require('../../../lib/constants');

describe('Soap Service', () => {
  describe('_getSoapClient', () => {
    it('should the existing client', done => {
      const service = new SoapService({});

      const clientStub = { SINON_FAKE_CLIENT: true };

      service._soapClient = clientStub;

      service._getSoapClient()
        .then(client => {
          client.should.have.property('SINON_FAKE_CLIENT');

          done();
        });
    });

    it('should create a new client if not existing', done => {
      const service = new SoapService({ wsdl: WSDL.ONECLICKFORAPP });

      service._getSoapClient()
        .then(client => {
          client.should.be.an.Object();
          client.constructor.name.should.equal('Client');
          client.should.have.properties(Object.keys(CLIENT_STUB.client));

          done();
        });
    }).timeout(5000);
  });
});
