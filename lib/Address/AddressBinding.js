/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const errors = require('../errors');

class AddressBinding {
  /**
   * AddressBinding combindes a pair of two addresses for sender and receiver.
   * 
   * @constructor
   * @param {Object} addresses
   * @param {Address} receiver - The receiver address.
   * @param {Address} sender - The sender address.
   */
  constructor({ receiver, sender } = {}) {
    if (!receiver || !sender) {
      throw Error(errors.usage.missingAddressBindings);
    }

    /** @type {Address} */
    this._receiver = receiver
    /** @type {Address} */
    this._sender = sender;
  }

  /**
   * The pair of sender and receiver address.
   * 
   * @returns {Object}
   */
  getAddresses() {
    return {
      sender: this._sender.getData(),
      receiver: this._receiver.getData()
    };
  }
}

module.exports = AddressBinding;
