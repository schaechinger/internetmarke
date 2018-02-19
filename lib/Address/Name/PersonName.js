class PersonName {
  /**
   * Defines the name of a person used to connect to an address.
   * 
   * @constructor
   * @param {Object} address
   * @param {string} name.firstname - The first name of the receiver.
   * @param {string} name.lastname - The last name of the receiver.
   * @param {string} [name.title] - The receiver's title if available.
   * @param {string} [name.salutation] - The salutation that fits the receiver.
   */
  constructor({ firstname, lastname, title = null, salutation = null }) {
    /** @type {string} */
    this._firstname = firstname;
    /** @type {string} */
    this._lastname = lastname;
    /** @type {(string|null)} */
    this._title = title;
    /** @type {(string|null)} */
    this._salutation = salutation;
  }

  /**
   * @returns {boolean}
   */
  isValid() {
    return !!this._firstname && !!this._lastname;
  }

  /**
   * @returns {Object} - Contains the data of the name in the api format.
   */
  getName() {
    const data = {
      personName: {
        firstname: this._firstname,
        lastname: this._lastname
      }
    };

    if (this._title) {
      data.title = this._title;
    }
    if (this._salutation) {
      data.salutation = this._salutation;
    }

    return data;
  }
}

module.exports = PersonName;
