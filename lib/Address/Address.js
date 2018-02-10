const { CompanyName, PersonName } = require('./Name');

const COUNTRY_CODES = require('./countries.json');

class Address {
  /**
   * The address of the receiver with an optional receiver or company name.
   * 
   * @constructor
   * @param {Object} address
   * @param {string} address.street - The street name of the receiver.
   * @param {string} address.houseNo - The house number of the receiver.
   * @param {string} address.zip - The ZIP code of the address.
   * @param {string} address.city - The name of the city.
   * @param {string} [address.country] - The country in ISO 3166 alpha-3 format.
   * @param {string} [address.additional] - Additional information about the address.
   */
  constructor({ street, houseNo, zip, city, country = COUNTRY_CODES.DEU, additional = null }) {
    this._street = street;
    this._houseNo = houseNo;
    this._zip = zip;
    this._city = city;
    this._additional = additional;

    // validate country code
    if (!country || !COUNTRY_CODES.hasOwnProperty(country)) {
      country = COUNTRY_CODES.DEU;

      // TODO: throw warning in dev mode
    }
    this._country = country;

    this._name = null;
  }

  /**
   * Add the name of the receiver to convert the address into a named address.
   * 
   * @param {(CompanyName|PersonName)} name - The (company) name of the receiver.
   */
  setName(name) {
    this._name = name;
  }
}

Address.COUNTRY_CODES = COUNTRY_CODES;
Address.PersonName = PersonName;
Address.CompanyName = CompanyName;

module.exports = Address;
