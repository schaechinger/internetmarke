import { stub } from 'sinon';

export const partnerStub: any = {
  getSoapHeaders: stub().returns({
    PARTNER_ID: 'partnerid',
    REQUEST_TIMESTAMP: '20210808-174300',
    KEY_PHASE: 1,
    PARTNER_SIGNATURE: '1234abcd'
  }),
  setCredentials: stub()
};
