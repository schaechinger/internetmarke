/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const Client = require('../ProductList/Client');

/**
 * Creates a new product client instance to access the prod web service.
 *
 * @param {Object} data
 * @param {string} data.username - The username of the client account
 *   <USERNAME>
 * @param {string} data.password - The password of the client account
 *   <PASSWORD>
 * @param {string} [data.id] - The dedicated id of the account if different
 *   from the username but in caps <MANDANTID>
*/
function create(data) {
  return new Client(data);
}

module.exports = { create };
