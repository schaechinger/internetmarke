/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

class Product {
  constructor(data) {
    /** @type {number} - The product id used on checkout. */
    this._id = 0;
    /** @type {number} - The price of the product in euro cents. */
    this._price = 0;

    /** @type {number} - The product list version the information are from. */
    this._ppl = 0;
    /** @type {string} - The readable product name. */
    this._name = null;
    /** @type {Object} - The dimension range in milli meters. */
    this._dimensions = {};
    /** @type {number[]} - The weight range in grams. */
    this._weight = [];

    if (data) {
      this._readData(data);
    }
  }

  /**
   * @returns {number}
   */
  getId() {
    return this._id;
  }

  /**
   * @returns {number}
   */
  getPrice() {
    return this._price;
  }

  /**
   * @returns {string}
   */
  getName() {
    return this._name;
  }

  /**
   * Checks the validity of the product by validating the id.
   * 
   * @returns {boolean}
   */
  isValid() {
    return !!this._id;
  }

  _readData(data = {}) {
    if (data.hasOwnProperty('extendedIdentifier')) {
      this._id = +data.extendedIdentifier.externIdentifier.attributes.id;
      this._name = data.extendedIdentifier.externIdentifier.attributes.name;

      this._ppl = +data.extendedIdentifier.externIdentifier.attributes.actualPPLVersion;

      this._price = data.priceDefinition.price.calculatedGrossPrice.attributes.value * 100;

      [ 'min', 'max' ].forEach((type, index) => {
        for (const key in data.dimensionList) {
          if (data.dimensionList.hasOwnProperty(key) && 'string' === typeof key) {
            this._dimensions[key] = this._dimensions[key] || [];
            this._dimensions[key].push(+data.dimensionList[key].attributes[type + 'Value']);
          }
        }
      });

      if (data.hasOwnProperty('weight')) {
        this._weight = [
          +data.weight.attributes.minValue,
          +data.weight.attributes.maxValue,
        ];
      }

      // TODO: save properties? ratio, allowedForm etc.

      // TODO: save stamp type list?

      // TODO: save account prod references?
    }
  }
}

module.exports = Product;
