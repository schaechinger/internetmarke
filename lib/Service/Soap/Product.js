/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const soap = require('soap');

const SoapService = require('./Soap'),
  { WSDL } = require('../../constants');

class SoapProductService extends SoapService {
  /**
   * Create a new product soap service.
   * 
   * @constructor
   * @param {Object} config
   * @param {Client} config.client - The product client with the credentials.
   */
  constructor({ client }) {
    super({ wsdl: WSDL.PRODUCT });

    /** @type {Client} */
    this._client = client;
  }

  /**
   * Fetch the list of available products with their information.
   * 
   * @returns {Promise.<(Object|boolean)>}
   */
  getProductList() {
    return this._getSoapClient()
      .then(client => {
        return client.getProductListAsync({
          mandantID: this._client.getId(),
          dedicatedProducts: true,
          responseMode: 0
        });
      })
      .then(response => {
        if ('true' !== response.attributes.success) {
          return false;
        }

        return response.Response;
      });
  }
  
  /**
   * Initialize the soap client with the product partner information headers.
   * 
   * @param {Client} client - The soap client object.
   */
  _initClient(client) {
    if (this._client) {
      const password = this._client.getPassword()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
      const options = {
        hasTimeStamp: false,
        hasTokenCreated: false
      };

      const security = new soap.WSSecurity(
        this._client.getUsername(),
        password,
        options
      );
      client.setSecurity(security);
    }
  }
}

module.exports = SoapProductService;
