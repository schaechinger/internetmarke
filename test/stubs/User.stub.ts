import { stub } from 'sinon';

export const userStub: any = {
  load: stub(),
  getCredentials: stub().returns({
    username: 'usernme',
    password: 'password'
  }),
  isAuthenticated: stub().returns(true),
  getToken: stub().returns('<TOKEN>'),
  getInfo: stub().returns({
    isAuthenticated: true,
    walletBalance: 1000,
    infoMessage: 'msg',
    showTermsAndCondition: true
  }),
  setCredentials: stub()
};
