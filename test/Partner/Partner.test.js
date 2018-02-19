const Partner = require('../../lib/Partner'),
  errors = require('../../lib/errors');

describe('Partner', () => {
  const args = {
    id: '12345',
    secret: '#MY_SECRET',
    keyPhase: 2
  };

  it('should require partner credentials', () => {
    (() => {
      const partner = new Partner();
    }).should.throw(errors.usage.missingPartnerCredentials);
  });

  it('should create instance with demo data', () => {
    const partner = new Partner(args);

    partner.should.be.ok();

    partner._id.should.equal(args.id);
    partner._secret.should.equal(args.secret);
    partner._keyPhase.should.equal(args.keyPhase);
  });

  describe('Signature', () => {    
    it('should generate a valid signature', () => {
      const partner = new Partner(args);

      // 2018-01-01 00:00:00 GMT
      const STUB_SIGNATURE = '63eb8415';
      const STUB_TIME = 1514764800000;
      const signature = partner.generateSignature();
      signature.should.be.a.String().and.match(/^[0-9a-f]{8}$/);
      signature.should.not.equal(STUB_SIGNATURE);

      var clock = sinon.useFakeTimers(STUB_TIME);
      partner.generateSignature().should.equal(STUB_SIGNATURE);
      clock.restore();
    });

    it('should return soap headers', () => {
      const partner = new Partner(args);

      // stubs
      const STUB_SIGNATURE = 'STUB_SIGNATURE';
      partner.generateSignature = sinon.stub().returns(STUB_SIGNATURE);
      const STUB_DATE = '20180101-000000';
      partner._germanDate.format = sinon.stub().returns(STUB_DATE);
      
      const headers = partner.getSoapHeaders();
      headers.should.be.an.Object();
      headers.should.have.property('PARTNER_ID').equal(args.id);
      headers.should.have.property('KEY_PHASE').equal(args.keyPhase);
      headers.should.have.property('REQUEST_TIMESTAMP').equal(STUB_DATE);
      headers.should.have.property('PARTNER_SIGNATURE').equal(STUB_SIGNATURE);
    });
  });
});
