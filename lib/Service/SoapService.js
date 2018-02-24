/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const soap = require('soap');

class SoapService {
  /**
   * Creates a new soap service instance.
   *
   * @constructor
   * @param {Object} config
   * @param {string} config.wsdl - The wsdl url that desclares the service.
   * @param {User} config.user - The user object to retrieve the session token.
   */
  constructor({ wsdl, user }) {
    this._wsdl = wsdl;
    this._user = user;

    this._soapClient = null;
  }

  /**
   * Helper method to retrieve the soap client for every api call.
   * 
   * @returns {Promise.<Client>}
   */
  _getSoapClient() {
    let promise = null;

    if (this._soapClient) {
      promise = Promise.resolve(this._soapClient);
    }
    else {
      promise = new Promise(resolve => {
        soap.createClientAsync(this._wsdl, {
          disableCache: true
        })
          .then(client => {
            this._soapClient = client;

            this._initClient(client);

            resolve(client);
          });
      });
    }

    return promise;
  }

  /**
   * Retrieve the client object in every case.
   * 
   * @param {Client} client - The client object that links to the web serice.
   */
  _initClient(client) {}
}

module.exports = SoapService;
