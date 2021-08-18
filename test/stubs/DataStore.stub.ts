import { stub } from 'sinon';

import { IDataStore } from '../../src/services/DataStore';

export const dataStoreStub: IDataStore<any> = {
  init: stub().returns(Promise.resolve()),
  getItem: stub(),
  getList: stub(),
  remove: stub(),
  update: stub().returns(Promise.resolve(true))
};
