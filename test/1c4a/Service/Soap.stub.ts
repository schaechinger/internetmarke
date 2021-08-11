import { stub } from 'sinon';

export const oneC4AStub = {
  authenticateUserAsync: stub().returns(Promise.resolve([{}])),
  createShopOrderIdAsync: stub().returns(
    Promise.resolve([
      {
        shopOrderId: 42
      }
    ])
  ),
  retrievePreviewVoucherPDFAsync: stub().returns(Promise.resolve([{ link: 'http://localhost' }])),
  retrievePreviewVoucherPNGAsync: stub().returns(Promise.resolve([{ link: 'http://localhost' }])),
  checkoutShoppingCartPDFAsync: stub().returns(Promise.resolve([{}])),
  checkoutShoppingCartPNGAsync: stub().returns(Promise.resolve([{}])),
  retrieveOrderAsync: stub().returns(Promise.resolve([{}])),
  retrievePageFormatsAsync: stub().returns(
    Promise.resolve([
      {
        pageFormat: [
          {
            id: 1
          }
        ]
      }
    ])
  ),
  retrievePrivateGalleryAsync: stub().returns(
    Promise.resolve([
      {
        imageLink: [
          {
            ink: 'http://localhost'
          }
        ]
      }
    ])
  ),
  retrievePublicGalleryAsync: stub().returns(
    Promise.resolve([
      {
        items: [
          {
            categoryId: 1
          }
        ]
      }
    ])
  ),
  addSoapHeader: stub()
};

export const get1C4AStub = () => Promise.resolve(oneC4AStub);
