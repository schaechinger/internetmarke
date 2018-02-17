const { CompanyName, PersonName } = require('./Name'),
  errors = require('../errors');

const COUNTRY_CODES = require('./countries.json');

class Address {
  /**
   * The address of a receiver or sender.
   * 
   * @constructor
   * @param {Object} address
   * @param {string} address.street - The street name of the address.
   * @param {string} address.houseNo - The house number of the address.
   * @param {string} address.zip - The ZIP code of the address.
   * @param {string} address.city - The name of the city.
   * @param {string} [address.country] - The country in ISO 3166 alpha-3 format.
   *   Default is DEU / Germany.
   * @param {string} [address.additional] - Additional information about the address.
   */
  constructor({ street, houseNo, zip, city, country, additional = null }) {
    /** @type {string} */
    this._street = street;
    /** @type {string} */
    this._houseNo = houseNo;
    /** @type {string} */
    this._zip = zip;
    /** @type {string} */
    this._city = city;
    /** @type {(string|null)} */
    this._additional = additional;

    // validate country code
    country = country || 'DEU';
    if (!COUNTRY_CODES.hasOwnProperty(country)) {
      throw Error(errors.usage.invalidCountryCode + country);
    }
    /** @type {string} */
    this._country = country;

    /** @type {(PersonName|CompanyName|null)} */
    this._name = null;
  }

  /**
   * @returns {boolean}
   */
  isNamed() {
    return !!this._name;
  }

  /**
   * Add the name of receiver or sender to convert the address into a
   * named address in the context of the api.
   * 
   * @param {(CompanyName|PersonName)} name - The (company) name of the receiver
   *  or sender.
   * @returns {Address}
   */
  setName(name) {
    this._name = name;

    return this;
  }

  /**
   * @returns {Object} - The object contains all information about the address
   *   in the format the api expects.
   */
  getData() {
    const address = {
      street: this._street,
      houseNo: this._houseNo,
      zip: this._zip,
      city: this._city,
      country: this._country
    };

    if (this._additional) {
      address.additional = this._additional;
    }

    let data = { address };

    if (this._name) {
      data = Object.assign(data, this._name.getName());
    }

    return data;
  }
}

Address.COUNTRY_CODES = COUNTRY_CODES;
Address.PersonName = PersonName;
Address.CompanyName = CompanyName;

module.exports = Address;
