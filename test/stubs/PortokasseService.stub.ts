import { stub } from 'sinon';
import { portokasseUserInfoResult } from './User.stub';

export const portokasseServiceStub: any = {
  init: stub().returns(Promise.resolve(true)),
  isInitialized: stub().returns(true),
  getUserInfo: stub().returns(portokasseUserInfoResult),
  topUp: stub()
};
