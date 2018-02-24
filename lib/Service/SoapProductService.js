/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const SoapService = require('./SoapService'),
  { WSDL } = require('../constants');

class SoapProductService extends SoapService {
  /**
   * Create a new product soap service.
   * 
   * @param {Object} config
   * @param {User} config.user - The user object to retrieve the session token.
   */
  constructor({ user }) {
    super({ wsdl: WSDL.PRODUCT, user });
  }

  /**
   * Fetch the list of available products with their information.
   * 
   * @returns {Object[]}
   */
  getProductList() {
    this._getSoapClient()
      .then(client => {
        return client.getProductListAsync({
          userToken: this._user.getUserToken()
        });
        console.log(client);
      });
  }
}

module.exports = SoapProductService;
