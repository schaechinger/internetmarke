import { stub } from 'sinon';

export const clientStub: any = {
  getId: stub().returns('clientid'),
  getPassword: stub().returns('password'),
  getUsername: stub().returns('username'),
  setCredentials: stub()
};
