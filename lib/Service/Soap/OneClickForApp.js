/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const SoapService = require('./Soap'),
  User = require('../../User'),
  { WSDL } = require('../../constants');

class OneClickForAppService extends SoapService {
  /**
   * Create an instance of the 1C4A soap webservice.
   * 
   * @constructor
   * @param {Object} config
   * @param {Partner} config.partner - The partner object that identifies the
   *   application for use with the api.
   * @param {User} config.user - The user object with the session token.
   */
  constructor({ partner }) {
    super({ wsdl: WSDL.OneClickForApp });

    /** @type {Partner} */
    this._partner = partner;
  }

  /**
   * Authorize an user to the api for check it's validity.
   * 
   * @param {User} user - the user object that should be authenticated.
   * @returns {Promise.<boolean>}
   */
  authenticateUser(user) {
    this._user = user;

    return this._getSoapClient()
      .then(client => {
        return client.authenticateUserAsync(this._user.getCredentials())
      })
      .then(response => {
        if (response) {
          this._user.setToken(response.userToken)
            .setBalance(response.walletBalance)
            .setTerms(response.showTermAndCondition)
            .setInfoMessage(response.infoMessage || null);
        }

        return !!response;
      });
  }

  /**
   * Generates a preview what the voucher will look like.
   * 
   * @param {Object} config
   * @param {number} config.productCode - The id of the product that should be
   *   previewed.
   * @param {string} config.voucherLayout - The layout of the voucher.
   * @param {string} config.outputFormat - The format the voucher should have.
   * @returns {Promise.<Object>}
   */
  previewVoucher({ productCode, voucherLayout, outputFormat }) {
    const method = `retrievePreviewVoucher${outputFormat}Async`;

    return this._getSoapClient()
      .then(client => {
        return client[method]({
          productCode,
          voucherLayout
        });
      })
      .then(response => {
        return {
          link: response.link
        };
      });
  }

  /**
   * Performs a checkout and retrieves the ordered vouchers.
   * 
   * @param {Object} data
   * @param {Object} data.order - The order information that hold the data about
   *   the vouchers.
   * @param {string} data.outputFormat - The format the voucher should have.
   * @returns {Promise.<Object>}
   */
  checkout({ order, outputFormat }) {
    return this._getSoapClient()
      .then(client => {
        const method = `checkoutShoppingCart${outputFormat}Async`;
        order = Object.assign({
          userToken: this._user.getToken()
        }, order);

        return client[method](order);
      })
      .then(response => {
        this._user.setBalance(response.walletBallance || response.walletBalance);

        return this._processShoppingCart(response);
      });
  }

  /**
   * Performs a checkout and retrieves the ordered vouchers.
   * 
   * @param {Object} data
   * @param {Object} data.order - The order information that hold the data about
   *   the vouchers.
   * @returns {Promise.<Object>}
   */
  retrieveOrder({ order }) {
    return this._getSoapClient()
      .then(client => {
        order = Object.assign({
          userToken: this._user.getToken(),
        }, order);
        return client.retrieveOrderAsync(order);
      })
      .then(this._processShoppingCart);
  }

  /**
   * Create a globally unique order id from the api.
   * 
   * @returns {Promise.<number>}
   */
  generateOrderId() {
    return this._getSoapClient()
      .then(client => {
        return client.createShopOrderIdAsync({
          userToken: this._user.getToken()
        })
      })
      .then(response => {
        this._user.addOrderId(response.shopOrderId);

        return response.shopOrderId;
      });
  }

  /**
   * Processes the data from the soap checkout method.
   * 
   * @param {Object} response - The raw response from the checkout or
   *   retrieveOrder method of the soap service.
   * @returns {Object}
   */
  _processShoppingCart(response) {
    const result = {
      orderId: response.shoppingCart.shopOrderId,
      link: response.link,
      vouchers: []
    };

    response.shoppingCart.voucherList.voucher.forEach(voucher => {
      const data = { id: voucher.voucherId };
      if (voucher.trackId) {
        data.trackingCode = voucher.trackId;
      }
      result.vouchers.push(data);
    });
    return result;
  }

  /**
   * Initialize the soap client with the partner information headers.
   * 
   * @param {Client} client - The soap client object.
   */
  _initClient(client) {
    if (this._partner) {
      client.addSoapHeader(this._partner.getSoapHeaders());
    }
  }
}

module.exports = OneClickForAppService;
