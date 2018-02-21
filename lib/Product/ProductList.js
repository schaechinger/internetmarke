/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const Product = require('./Product');

class ProductList {
  /**
   * 
   * 
   * @constructor
   */
  constructor() {

  }

  /**
   * 
   * @param {Promise.<Object>} soapClient 
   */
  loadProducts(soapClient) {
    soapClient.then(client => {

    });
  }

  /**
   * Used to get a voucher for the given letter or package.
   * 
   * @param {Object} data
   * @param {number} data.weight - The weight of the package in gramms.
   * @param {string} data.dimensions - The dimensions of the package in
   *   milli meters in the LxWxH format.
   * @param {boolean} data.domestic - Specifies whether the package is domestic
   *   or international.
   */
  matchProduct({ weight, dimensions, domestic }) {

  }
}

module.exports = ProductList;
