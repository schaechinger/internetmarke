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
  constructor({ company, ...personName }) {
    super(Object.assign({ firstname: null, lastname: null }, personName));

    /** @type {string} */
    this._company = company;
  }

  /**
   * @returns {Object}
   */
  getName() {
    let data = super.getName();

    data = { companyName: data.personName };

    [
      'firstname', 'lastname'
    ].forEach(key => {
      if (null === data.companyName[key]) {
        delete data.companyName[key];
      }
    });

    data.companyName.company = this._company;

    return data;
  }
}

module.exports = CompanyName;
