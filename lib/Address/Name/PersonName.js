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
   * Retrieves the data of the name in the api format or false if the person
   * name is invalid.
   * WARNING: names get cut after 35, title and salutation after 10 characters!
   * 
   * @returns {(Object|boolean)}
   */
  getName() {
    if (!this.isValid()) {
      return false;
    }

    const personName = {
      firstname: (this._firstname || '').substr(0, 35),
      lastname: (this._lastname || '').substr(0, 35)
    };

    if (this._title) {
      personName.title = this._title.substr(0, 10);
    }
    if (this._salutation) {
      personName.salutation = this._salutation.substr(0, 10);
    }

    return { personName };
  }
}

module.exports = PersonName;
