import { stub } from 'sinon';
import { UserInfo } from '../../src/User';

export const userInfoResult: UserInfo = {
  isAuthenticated: true,
  walletBalance: {
    value: 10,
    currency: 'EUR'
  },
  infoMessage: 'msg',
  showTermsAndCondition: true
};

export const userStub: any = {
  load: stub(),
  getCredentials: stub().returns({
    username: 'usernme',
    password: 'password'
  }),
  isAuthenticated: stub().returns(true),
  getToken: stub().returns('<TOKEN>'),
  getInfo: stub().returns(userInfoResult),
  setCredentials: stub(),
  addOrderId: stub()
};

export const unauthorizedUserInfoResult: UserInfo = {
  isAuthenticated: false
};

export const unauthorizedUserStub: any = {
  load: stub(),
  getCredentials: stub().returns({
    username: 'usernme',
    password: 'password'
  }),
  isAuthenticated: stub().returns(true),
  getToken: stub().returns(null),
  getInfo: stub().returns(unauthorizedUserInfoResult),
  setCredentials: stub(),
  addOrderId: stub()
};

export const portokasseUserInfoResult: UserInfo = {
  isAuthenticated: true,
  walletBalance: {
    value: 20,
    currency: 'EUR'
  },
  infoMessage: 'message'
};

export const portokasseUserStub: any = {
  load: stub(),
  getCredentials: stub().returns({
    username: 'usernme',
    password: 'password'
  }),
  isAuthenticated: stub().returns(true),
  getToken: stub().returns('<TOKEN>'),
  getInfo: stub().returns(portokasseUserInfoResult),
  setCredentials: stub()
};
