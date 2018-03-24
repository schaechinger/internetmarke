/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const User = require('../User');

/**
 * Creates a new user instance used to voucher transactions.
 * 
 * @param {Object} data - The credentials of the account.
 * @param {string} data.username - The username (email address).
 * @param {string} data.password - The corresponding password.
 */
function create(data) {
  return new User(data);
}

module.exports = { create };
