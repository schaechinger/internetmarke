import { expect } from 'chai';
import { Partner } from '../../src/1c4a/Partner';
import { partnerCredentials } from './helper';

describe('Partner', () => {
  let partner: Partner;

  beforeEach(() => {
    partner = new Partner();
    partner.setCredentials(partnerCredentials);
  });

  it('should generate the soap header', () => {
    const header = partner.getSoapHeaders();

    expect(header.PARTNER_ID).to.equal(partnerCredentials.id);
    expect(header.REQUEST_TIMESTAMP).to.be.a.string;
    expect(header.KEY_PHASE).to.equal(partnerCredentials.keyPhase);
    expect(header.PARTNER_SIGNATURE).to.be.a.string;
    expect(header.PARTNER_SIGNATURE).to.be.of.length(8);
  });

  it('should generate the soap header without keyPhase', () => {
    const cred = { ...partnerCredentials };
    delete cred.keyPhase;
    partner.setCredentials(cred);

    const header = partner.getSoapHeaders();

    expect(header.KEY_PHASE).to.equal(1);
  });
});
