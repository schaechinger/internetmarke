import { stub } from 'sinon';

import { userInfoResult } from './User.stub';

export const oneClickForAppServiceStub: any = {
  init: stub().returns(Promise.resolve(true)),
  isInitialized: stub().returns(true),
  getUserInfo: stub().returns(userInfoResult),
  retrievePageFormats: stub(),
  retrievePageFormat: stub(),
  createShopOrderId: stub(),
  retrievePublicGallery: stub(),
  retrievePrivateGallery: stub(),
  retrievePreviewVoucher: stub(),
  addItemToShoppingCart: stub(),
  getItemFromShoppingCart: stub(),
  removeItemFromShoppingCart: stub(),
  getShoppingCartSummary: stub(),
  checkoutShoppingCart: stub(),
  retrieveOrder: stub()
};
