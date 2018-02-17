const md5 = require('md5');

const GermanDate = require('../Date/GermanDate'),
  errors = require('../errors')

const SIGNATURE_SEPARATOR = '::';
const SIGNATURE_EMPTY = '::::';

class Partner {
  /**
   * A partner defines an account that is entitled to use the api.
   * 
   * Accounts can be requested on the website of the Deutsche Post:
   * https://deutschepost.de/de/i/internetmarke-porto-drucken/partner-werden.html
   * 
   * @constructor
   * @param {Object} partner - The partner information to access the api.
   * @param {string} partner.id - The partner id as specified in your account
   *   <PARTNER_ID>.
   * @param {string} partner.secret - The secret as specified in your account
   *   <SCHLUESSEL_DPWN_MARKTPLATZ>.
   * @param {number} [partner.keyPhase] - The key phase as specified in your
   *   account <KEY_PHASE>.
   */
  constructor({ id, secret, keyPhase = 1 } = {}) {
    if (!id || !secret) {
      throw new Error(errors.usage.missingPartnerCredentials);
    }

    /** @type {string} */
    this._id = id.trim();
    /** @type {string} */
    this._secret = secret.trim();
    /** @type {number} */
    this._keyPhase = keyPhase;

    this._germanDate = new GermanDate();
  }

  /**
   * @returns {string}
   */
  getId() {
    return this._id;
  }

  /**
   * @returns {string}
   */
  getSecret() {
    return this._secret;
  }

  /**
   * @returns {number}
   */
  getKeyPhase() {
    return this._keyPhase;
  }

  /**
   * Calculate the 8 char signature of the partner to check it's validity.
   * 
   * @param {(Date|null)} [date] - The current or given date to use in the signature.
   * @returns {string}
   */
  generateSignature(date = null) {
    const signature = [
      this._id || SIGNATURE_EMPTY,
      this._germanDate.format(date) || SIGNATURE_EMPTY,
      this._keyPhase || SIGNATURE_EMPTY,
      this._secret || SIGNATURE_EMPTY
    ].join(SIGNATURE_SEPARATOR);

    const sig = md5(signature);
    
    return sig.substr(0, 8);
  }

  /**
   * Retrieve the headers to authenticate the partner in the soap requests.
   * 
   * @returns {Object}
   */
  getSoapHeaders() {
    const date = new Date();

    return {
      PARTNER_ID: this._id,
      REQUEST_TIMESTAMP: this._germanDate.format(date),
      KEY_PHASE: this._keyPhase,
      PARTNER_SIGNATURE: this.generateSignature(date)
    };
  }
}

module.exports = Partner;
