/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const soap = require('soap'),
  path = require('path');

const errors = require('./errors'),
  Gallery = require('./Gallery'),
  Order = require('./Order'),
  Partner = require('./Partner'),
  User = require('./User'),
  ProductList = require('./ProductList'),
  factory = require('./Factory'),
  OneClickForAppService = require('./Service/Soap/OneClickForApp'),
  AddressFactory = require('./Address/AddressFactory'),
  layoutZoneHelper = require('./helper/LayoutZones'),
  { LAYOUT_ZONES, OUTPUT_FORMATS } = require('./constants');

const _PARTNER = Symbol('partner'),
  _USER = Symbol('user');

class Internetmarke {
  /**
   * The main class of the module that holds the public methods to generate vouchers.
   * 
   * @constructor
   * @param {Partner} partner - The partner object that should be used for
   *   every request.
   */
  constructor(partner) {
    /** @type {(Partner)} */
    this[_PARTNER] = partner;
    /** @type {(User|null)} */
    this[_USER] = null;

    /** @type {Gallery} */
    this._gallery = new Gallery();
    /** @type {Order} */
    this._order = new Order();
    /** @type {OneClickForAppService} */
    this._1C4AService = new OneClickForAppService({ partner });
    /** @type {(ProductList|null)} */
    this._productList = null;
    /** @type {Object} */
    this._config = {
      outputFormat: OUTPUT_FORMATS.PNG,
      voucherLayout: LAYOUT_ZONES.ADDRESS
    };
  }

  /**
   * Authorize an user to the api for check it's validity.
   *
   * @param {User} user - the user object that should be authenticated.
   * @returns {Promise.<Internetmarke>}
   */
  authenticateUser(user) {
    this[_USER] = user;

    return this._1C4AService.authenticateUser(this[_USER])
      .then(success => {
        return this;
      });
  }

  /**
   * Add another voucher to the order list.
   * 
   * @param {Object} position
   * @param {number} position.productCode - The product code of the voucher.
   * @param {number} position.price - The price of the product that should be
   *   order for security reasons.
   * @param {string} [position.voucherLayout] - The layout of the voucher.
   * @param {AddressBinding} [position.addressBinding] - The pair of addresses
   *   if available. This is only possible for AddressZone layout.
   * @returns {Internetmarke}
   */
  orderVoucher({ productCode, price, voucherLayout = this._config.voucherLayout,
    addressBinding = null }) {
    this._order.addPosition({ productCode, voucherLayout, price, addressBinding });

    return this;
  }

  /**
   * Checkout the order list. This is where your wallet will be charged!
   * 
   * @param {Object} options
   * @param {number} [options.orderId] - A unique order id if your system
   *   requires a specific one.
   * @returns {Promise.<Object>} - The shopping cart with the link to the zip
   *   archive, the order id and the coucher ids.
   */
  checkout({ orderId = null } = {}) {
    let order = this._order.getCheckout({ orderId });

    if (order.total > this[_USER].getBalance()) {
      throw new Error(errors.internetmarke.walletEmpty);
    }

    return this._1C4AService.checkout({
      order,
      user: this[_USER],
      outputFormat: this._config.outputFormat
    });
  }

  /**
   * Generate a preview of a voucher.
   * 
   * @param {Object} preview
   * @param {number} preview.productCode - The product code as defined from
   *   the API.
   * @param {number} [preview.imageId] - The id of the image that should be
   *   printed next to the voucher.
   * @returns {Promise.<Object>} - The url of the preview voucher.
   */
  getVoucherPreview({ productCode, imageId = null }) {
    return this._1C4AService.previewVoucher({
      productCode,
      imageId,
      voucherLayout: this._config.voucherLayout,
      outputFormat: this._config.outputFormat
    });
  }

  /**
   * 
   * @param {Object} data
   * @param {Client} data.client - The credentials of the client registered for
   *   the product service (prod ws).
   */
  enableProductList({ client }) {
    if (!this._productList) {
      this._productList = new ProductList({ client });
    }
  }

  /**
   * Retrieves the whole list of products available at the product service.
   * 
   * @returns {Promise.<Product[]>}
   */
  getProductList() {
    this._checkProductList();

    return this._productList.loadProducts()
      .then(success => {
        return this._productList._products;
      });
  }

  /**
   * Tries to find a product matching the given criteria.
   * 
   * @param {Object} parameters
   * @param {number} [parameters.id] - The id of the product as used with the
   *   1c4a service.
   * 
   * @returns {Promise.<(Product|Product[])>}
   */
  findProduct({ id = null } = {}) {
    this._checkProductList();

    let product = null;

    if (id) {
      product = this._productList.getProduct(id)
    }
    else {
      product = this._productList.matchProduct(arguments);
    }

    return Promise.resolve(product);
  }

  _checkProductList() {
    if (!this._productList) {
      throw new Error(errors.usage.missingProductClient);
    }
  }

  /**
   * Update galleries (public and private) and save results locally.
   * 
   * @returns {Promise.<boolean[]>}
   */
  updateGalleries() {
    return Promise.resolve(this);
    //return this._gallery.updateGalleries(this._getSoapClient());
  }

  /**
   * Specify the layout of the voucher from the LAYOUT_ZONES enum.
   * 
   * @param {string} voucherLayout - The layout that should be used.
   * @returns {boolean}
   */
  setDefaultVoucherLayout(voucherLayout) {
    const valid = layoutZoneHelper.validate(voucherLayout);

    if (valid) {
      this._config.voucherLayout = voucherLayout;
    }

    return valid;
  }
}

/** @deprecated Will be removed in v0.4.0. Please use Internetmarke.factory.createPartner instead! */
Internetmarke.Partner = Partner;
/** @deprecated Will be removed in v0.4.0. Please use Internetmarke.factory.createUser instead! */
Internetmarke.User = User;
/**
 * @deprecated Will be removed in v0.4.0. Please use Internetmarke.factory.createAddress or
 *   Internetmarke.factory.bindAddress instead!
 */
Internetmarke.AddressFactory = AddressFactory;

Internetmarke.factory = factory;

Internetmarke.OUTPUT_FORMATS = OUTPUT_FORMATS;
Internetmarke.LAYOUT_ZONES = LAYOUT_ZONES;

module.exports = Internetmarke;
