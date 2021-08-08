import { stub } from 'sinon';

export const oneC4AStub = {
  authenticateUserAsync: stub().returns(Promise.resolve([{}])),
  createShopOrderIdAsync: stub().returns(Promise.resolve([{}])),
  retrievePreviewVoucherPDFAsync: stub().returns(Promise.resolve([{}])),
  retrievePreviewVoucherPNGAsync: stub().returns(Promise.resolve([{}])),
  checkoutShoppingCartPDFAsync: stub().returns(Promise.resolve([{}])),
  checkoutShoppingCartPNGAsync: stub().returns(Promise.resolve([{}])),
  retrieveOrderAsync: stub().returns(Promise.resolve([{}])),
  retrievePageFormatsAsync: stub().returns(Promise.resolve([{}])),
  retrievePublicGalleryAsync: stub().returns(Promise.resolve([{}])),
  retrievePrivateGalleryAsync: stub().returns(Promise.resolve([{}])),
  addSoapHeader: stub()
};

export const get1C4AStub = () => Promise.resolve(oneC4AStub);
