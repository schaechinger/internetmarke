const response = {
  authenticateUserAsync: {
    userToken: '#12_USER_TOKEN',
    walletBalance: 12300,
    showTermAndCondition: true
  },
  checkoutShoppingCartPNGAsync: {
    walletBallance: 4200,
    link: 'https://schaechinger.com',
    shoppingCart: {
      shopOrderId: 1234,
      voucherList: {
        voucher: [
          {
            voucherId: 'A1234'
          },
          {
            voucherId: 'B1234',
            trackId: 'PP-1234567890-DE'
          }
        ]
      }
    }
  },
  createShopOrderIdAsync: {
    shopOrderId: 1234567890
  },
  retrievePreviewVoucherPNGAsync: {
    link: 'https://schaechinger.com'
  }
};

const client = {
  addSoapHeader: sinon.stub(),
  authenticateUserAsync: sinon.stub().returns(Promise.resolve(response.authenticateUserAsync)),
  checkoutShoppingCartPNGAsync: sinon.stub().returns(
    Promise.resolve(response.checkoutShoppingCartPNGAsync)
  ),
  createShopOrderIdAsync: sinon.stub().returns(
    Promise.resolve(response.createShopOrderIdAsync)
  ),
  retrievePreviewVoucherPNGAsync: sinon.stub().returns(
    Promise.resolve(response.retrievePreviewVoucherPNGAsync)
  )
};

module.exports = {
  client,
  response
};
