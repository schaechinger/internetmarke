/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const Client = require('./Client'),
  Product = require('./Product'),
  ProductService = require('../Service/Soap/Product');

class ProductList {
  /**
   * Create a new product list instance with the partner credentials for the
   * product web service.
   * 
   * @constructor
   * @param {Object} config
   * @param {Client} config.client - The product service client object.
   * @param {boolean} config.forceLoad - Indicates whether the product list
   *   should be updated immediately.
   */
  constructor({ client, forceLoad = false }) {
    /** @type {ProductService} */
    this._productService = new ProductService({ client });

    /** @type {Product[]} */
    this._products = [];

    if (forceLoad) {
      this.loadProducts();
    }
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
   * @returns {Promise.<boolean>}
   */
  loadProducts() {
    return this._productService.getProductList()
      .then(products => {
        if (!products) {
          return false;
        }

        products.salesProductList.SalesProduct.forEach(data => {
          const product = new Product(data);
          if (product.isValid()) {
            this._products[product.getId()] = product;
          }
        });

        // TODO: what about other prod types?

        return true;
      });
  }
}

module.exports = ProductList;
