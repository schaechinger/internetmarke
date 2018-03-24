/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const Partner = require('../Partner');

/**
 * Creates a new partner instance to access the 1C4A web service.
 * 
 * @param {Object} data - The partner information to access the api.
 * @param {string} data.id - The partner id as specified in your account
 *   <PARTNER_ID>.
 * @param {string} data.secret - The secret as specified in your account
 *   <SCHLUESSEL_DPWN_MARKTPLATZ>.
 * @param {number} [data.keyPhase] - The key phase as specified in your
 *   account <KEY_PHASE>.
 */
function create(data) {
  return new Partner(data);
}

module.exports = { create };
