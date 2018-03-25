/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const Client = require('./Client'),
  Product = require('./Product'),
  ProductService = require('../Service/Soap/Product'),
  Temp = require('../helper/Temp');

const UPDATE_INTERVAL = 86400000;

class ProductList {
  /**
   * Create a new product list instance with the partner credentials for the
   * product web service.
   * 
   * @constructor
   * @param {Object} config
   * @param {Client} config.client - The product service client object.
   */
  constructor({ client }) {
    /** @type {ProductService} */
    this._productService = new ProductService({ client });
    /** @type {Product[]} */
    this._products = [];
    /** @type {(Date|null)} */
    this._lastUpdate = null;
    /** @type {Temp} */
    this._temp = new Temp({ file: 'productlist.json' });
  }

  /**
   * Retrieves the product with the given id if available, null otherwise.
   * 
   * @param {number} id - The product id as used in the 1c4a service.
   * @returns {(Product|null)}
   */
  getProduct(id) {
    return this._products[id] || null;
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
   * @returns {(Product|null)}
   */
  matchProduct({ weight = 0, dimensions = 0, domestic = true }) {
    return null;
  }

  /**
   * Loads the list of products from the service to make it available to the
   * internetmarke module.
   * 
   * @param {boolean} forceLoad - Determine whether the product list should be
   *   forced to be updated from the web service.
   * @returns {Promise.<boolean>}
   */
  loadProducts() {
    return this._productService.getProductList()
      .then(data => {
        this._temp.update(JSON.stringify(data));

        return this._parseData(data);
      });
  }

  init() {
    return this._temp.get()
      .then(data => {
        data = data.toString();

        if (data) {
          data = JSON.parse(data);
          this._parseData(data);
        }

        if (!data || UPDATE_INTERVAL < new Date() - this._lastUpdate) {
          return this.loadProducts();
        }
        else {
          return true;
        }
      });
  }

  /**
   * Runs through the product object and generates the product list.
   * 
   * @param {Object} products - The raw data of the product list with meta
   *   information.
   */
  _parseData(products) {
    if (!products) {
      return false;
    }

    this._lastUpdate = new Date(products.date);

    products.salesProductList.SalesProduct.forEach(data => {
      const product = new Product(data);
      if (product.isValid()) {
        this._products[product.getId()] = product;
      }
    });

    // TODO: what about other prod types?

    return true;
  }
}

module.exports = ProductList;
