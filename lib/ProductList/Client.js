/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const errors = require('../errors');

class Client {
  /**
   * Create a new product service client object holding the credentials to
   * connect to the product web service.
   * 
   * Client account for the prod ws can be requested via mail:
   * pcf-1click@deutschepost.de
   * 
   * @constructor
   * @param {Object} client
   * @param {string} client.username - The username of the client account
   *   <USERNAME>
   * @param {string} client.password - The password of the client account
   *   <PASSWORD>
   * @param {string} [client.id] - The dedicated id of the account if different
   *   from the username but in caps <MANDANTID>
   */
  constructor({ username, password, id = null }) {
    if (!username || !password) {
      throw new Error(errors.usage.missingClientCredentials);
    }
    /** @type {string} */
    this._username = username;
    /** @type {string} */
    this._password = password;
    /** @type {string} */
    this._id = id || this._username.toUpperCase();
  }

  /**
   * @returns {string}
   */
  getUsername() {
    return this._username;
  }

  /**
   * @returns {string}
   */
  getPassword() {
    return this._password;
  }

  /**
   * @returns {string}
   */
  getId() {
    return this._id;
  }
}

module.exports = Client;
