import { expect } from 'chai';
import { Partner, PartnerCredentials } from '../../src/1c4a/Partner';

describe('Partner', () => {
  let partner: Partner;
  const credentials: PartnerCredentials = {
    id: 'partnerid',
    secret: 'secret',
    keyPhase: 2
  };

  beforeEach(() => {
    partner = new Partner();
    partner.setCredentials(credentials);
  });

  it('should generate the soap header', () => {
    const header = partner.getSoapHeaders();

    expect(header.PARTNER_ID).to.equal(credentials.id);
    expect(header.REQUEST_TIMESTAMP).to.be.a.string;
    expect(header.KEY_PHASE).to.equal(credentials.keyPhase);
    expect(header.PARTNER_SIGNATURE).to.be.a.string;
    expect(header.PARTNER_SIGNATURE).to.be.of.length(8);
  });

  it('should generate the soap header without keyPhase', () => {
    const cred = { ...credentials };
    delete cred.keyPhase;
    partner.setCredentials(cred);

    const header = partner.getSoapHeaders();

    expect(header.KEY_PHASE).to.equal(1);
  });
});
