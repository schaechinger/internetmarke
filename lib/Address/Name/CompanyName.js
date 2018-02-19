const PersonName = require('./PersonName');

class CompanyName extends PersonName {
  /**
   * The name extension for companies with an optional person as receiver.
   * 
   * @constructor
   * @param {Object} name
   * @param {string} name.company - The name of the company.
   * @param {string} [name.firstname] - The first name of the receiver.
   * @param {string} [name.lastname] - The last name of the receiver.
   * @param {string} [name.title] - The receiver's title if available.
   * @param {string} [name.salutation] - The salutation that fits the receiver.
   */
  constructor({ company, firstname = null, lastname = null, title = null,
    salutation = null }) {
    super({ firstname, lastname, title, salutation });

    /** @type {string} */
    this._company = company;
  }

  /**
   * @returns {boolean}
   */
  isValid() {
    return !!this._company;
  }

  /**
   * Retrieves the information about the company in the api format or false if
   * the person name is invalid.
   * WARNING: company name gets cut after 50 characters!
   * 
   * @returns {(Object|boolean)}
   */
  getName() {
    if (!this.isValid()) {
      return false;
    }
    
    let companyName = {};

    if (super.isValid()) {
      companyName = super.getName();
    }

    companyName.company = this._company.substr(0, 50);

    return { companyName };
  }
}

module.exports = CompanyName;
