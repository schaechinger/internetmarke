/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const SoapService = require('./SoapService'),
  { WSDL } = require('../constants');

class Soap1C4AService extends SoapService {
  /**
   * Create an instance of the 1C4A soap webservice.
   * 
   * @constructor
   * @param {Object} config
   * @param {Partner} config.partner - The partner object that identifies the
   *   application for use with the api.
   * @param {User} config.user - The user object with the session token.
   */
  constructor({ partner, user }) {
    super({ wsdl: WSDL['1C4A'], user });

    this._partner = partner;

    this.order = null;
  }

  /**
   * Authorize an user to the api for check it's validity.
   * 
   * @param {User} user - the user object that should be authenticated.
   * @returns {Promise.<Internetmarke>}
   */
  authenticateUser(user) {
    this._user= user;

    return this._getSoapClient()
      .then(client => {
        return client.authenticateUserAsync(this_user.getCredentials())
      })
      .then(response => {
        if (response) {
          this_user.setToken(response.userToken)
            .setBalance(response.walletBalance)
            .setTerms(response.showTermAndCondition)
            .setInfoMessage(response.infoMessage || null);
        }

        return this;
      })
      .catch(reason => {
        // TODO: check error type and message
        // throw error error.internetmarke.invalidUserCredentials

        // OperationalError {cause: Error: ns2:Server: Unknown user or invalid passwor…, isOperational: true, root: Object, response: IncomingMessage, body: "<?xml version='1....
      });
  }

  previewStamp({  }) {

  }
  /**
    * Add another voucher to the order list.
    * 
    * @param {Object} position
    * @param {number} position.productCode - The product code of the voucher.
    * @param {number} position.price - The price of the product that should be
    *   order for security reasons.
    * @param {string} [position.voucherLayout] - The layout of the voucher.
    * @param {AddressBinding} [position.addressBinding] - The pair of addresses
    *   if available. This is only possible for AddressZone layout.
    * @returns {Internetmarke}
    */
  orderVoucher({ productCode, price, voucherLayout = this._config.voucherLayout,
    addressBinding = null }) {
    this._order.addPosition({ productCode, voucherLayout, price, addressBinding });

    return this;
  }

  checkout() {

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

module.exports = Soap1C4AService;
