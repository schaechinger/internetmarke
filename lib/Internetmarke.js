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

Internetmarke.Partner = Partner;
Internetmarke.User = User;
Internetmarke.AddressFactory = AddressFactory;

Internetmarke.OUTPUT_FORMATS = OUTPUT_FORMATS;
Internetmarke.LAYOUT_ZONES = LAYOUT_ZONES;

module.exports = Internetmarke;
