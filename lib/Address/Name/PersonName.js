class PersonName {
  /**
   * @constructor
   * @param {Object} address
   * @param {string} name.firstname - The first name of the receiver.
   * @param {string} name.lastname - The last name of the receiver.
   * @param {string} [name.title] - The receiver's title if available.
   * @param {string} [name.salutation] - The salutation that fits the receiver.
   */
  constructor({ firstname, lastname, title = null, salutation = null }) {
    this._firstname = firstname;
    this._lastname = lastname;
    this._title = title;
    this._salutation = salutation;
  }
}

module.exports = PersonName;
