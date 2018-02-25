/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const { CompanyName, PersonName } = require('./Name'),
  errors = require('../errors');

const COUNTRY_CODES = require('./countries');

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
    this._city = city;
    /** @type {(string|null)} */
    this._additional = additional;

    if ('number' === typeof houseNo) {
      houseNo += '';
    }    /** @type {string} */
    this._houseNo = houseNo;
    if ('number' === typeof zip) {
      zip += '';
    }
    /** @type {string} */
    this._zip = zip;

    country = country || COUNTRY_CODES.DEFAULT;
    if (!COUNTRY_CODES[country]) {
      throw Error(errors.usage.invalidCountryCode + country);
    }
    /** @type {string} */
    this._country = country;

    /** @type {(PersonName|CompanyName|null)} */
    this._name = null;
  }

  /**
   * Verifies whether the address contains a valid person or company name.
   * 
   * @returns {boolean}
   */
  isNamed() {
    return !!this._name && this._name.isValid();
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
   * The object contains all information about the address in the format the
   * api expects.
   * WARNING: street and additional get cut after 50, city after 35 and
   *   zip and houseNo after 10 characters!
   * 
   * @returns {Object}
   */
  getData() {
    let address = {
      street: (this._street || '').substr(0, 50),
      houseNo: (this._houseNo || '').substr(0, 10),
      zip: (this._zip || '').substr(0, 10),
      city: (this._city || '').substr(0, 35),
      country: this._country
    };

    if (this._additional) {
      address = Object.assign(
        { additional: this._additional.substr(0, 50) },
        address
      );
    }

    let data = {};

    if (this.isNamed()) {
      data.name = this._name.getName();
    }
    
    data.address = address;
    
    return data;
  }
}

Address.COUNTRY_CODES = COUNTRY_CODES;
Address.PersonName = PersonName;
Address.CompanyName = CompanyName;

module.exports = Address;
