const md5 = require('md5');

const GermanDate = require('../Date/GermanDate');

const SIGNATURE_SEPARATOR = '::';

class Partner {
  /**
   * A partner defines an account that is entitled to use the api.
   * 
   * Accounts can be requested on the website of the Deutsche Post:
   * https://deutschepost.de/de/i/internetmarke-porto-drucken/partner-werden.html
   * 
   * @constructor
   * @param {Object} partner
   * @param {string} partner.id - The partner id as specified in your account.
   * @param {string} partner.secret - The secret as specified in your account.
   * @param {number} [partner.keyPhase] - The key phase as specified in your account.
   */
  constructor({ id, secret, keyPhase = 1 } = {}) {
    this._id = id || null;
    this._secret = secret || null;
    this._keyPhase = keyPhase;

    this._germanDate = new GermanDate();
  }

  /**
   * @returns {(string|null)}
   */
  getId() {
    return this._id;
  }

  /**
   * @returns {(string|null)}
   */
  getSecret() {
    return this._secret;
  }

  /**
   * @returns {(number|null)}
   */
  getKeyPhase() {
    return this._keyPhase;
  }

  /**
   * Calculate the 8 char signature of the partner to check it's validity.
   * 
   * @param {(Date|null)} [date] - The formatted date that should be used.
   * @returns {string}
   */
  generateSignature(date = null) {
    const signature = [
      this._id,
      this._germanDate.format(date),
      this._keyPhase,
      this._secret
    ].join(SIGNATURE_SEPARATOR);

    return md5(signature).substr(0, 8);
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
