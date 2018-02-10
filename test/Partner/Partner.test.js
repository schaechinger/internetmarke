const Partner = require('../../lib/Partner');

describe('Partner', () => {
  it('should create instance with empty data', () => {
    const partner = new Partner();

    partner.should.be.ok();

    should.not.exist(partner.getId());
    should.not.exist(partner.getSecret());
    partner.getKeyPhase().should.equal(1);
  });

  it('should create instance with demo data', () => {
    const args = {
      id: '12345',
      secret: '#MY_SECRET',
      keyPhase: 2
    };

    const partner = new Partner(args);

    partner.should.be.ok();

    partner.getId().should.equal(args.id);
    partner.getSecret().should.equal(args.secret);
    partner.getKeyPhase().should.equal(args.keyPhase);

    partner.generateSignature().should.match(/^[0-9a-f]{8}$/);
  });
});
