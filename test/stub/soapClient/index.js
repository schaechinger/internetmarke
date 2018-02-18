const response = {
  authenticateUserAsync: {
    userToken: '#12_USER_TOKEN',
    walletBalance: 12300,
    showTermAndCondition: false
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
  }
};

const client = {
  authenticateUserAsync: sinon.stub().returns(Promise.resolve(response.authenticateUserAsync)),
  checkoutShoppingCartPNGAsync: sinon.stub().returns(
    Promise.resolve(response.checkoutShoppingCartPNGAsync)
  )
};

module.exports = {
  client,
  response
};
