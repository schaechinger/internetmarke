/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

const AddressBinding = require('../Address/AddressBinding'),
  errors = require('../errors'),
  layoutZoneHelper = require('../helper/LayoutZones'),
  { LAYOUT_ZONES } = require('../constants');

class Position {
  /**
   * Creates a position that defines a product in the shopping cart.
   * 
   * @constructor
   * @param {Object} position
   * @param {number} position.productCode - The product code that identifies the
   *   product in the api.
   * @param {string} position.voucherLayout - The layout the voucher should be
   *   generated in.
   * @param {number} position.price - The price of the product in euro cents.
   * @param {AddressBinding} [position.addressBinding] - The pair of addresses
   *   of sender and receiver if available (this will only work for the address
   *   layout).
   * @param {number} [position.imageId] - The id of the image that should be
   *   printed next to the voucher code.
   * @param {string} [position.additionalInfo] - Additional information that
   *   belong to the voucher.
   */
  constructor({ productCode, voucherLayout, price, addressBinding = null,
    imageId = null, additionalInfo = null }) {
    if (!productCode || !voucherLayout) {
      throw new Error(errors.usage.missingPositionParameters);
    }

    if (!layoutZoneHelper.validate(voucherLayout)) {
      throw new Error(errors.usage.invalidLayoutZone + voucherLayout);
    }

    /** @type {number} */
    this._productCode = productCode;
    /** @type {string} */
    this._voucherLayout = voucherLayout;
    /** @type {AddressBinding} */
    this._addressBinding = addressBinding;
    /** @type {number} */
    this._imageId = imageId;
    /** @type {(string|null)} */
    this._additionalInfo = additionalInfo;

    // TODO: lookup product and update price
    /** @type {number} */
    this._price = price;

    // validate addressBinding and layout
    if (this._addressBinding && LAYOUT_ZONES.ADDRESS !== this._voucherLayout) {
      console.log('address bindings are only supported in address zone!');
      this._addressBinding = null;
    }
  }

  /**
   * Converts the position in the required api format.
   * 
   * @returns {Object}
   */
  getPosition() {
    const position = {
      productCode: this._productCode
    };
    if (this._addressBinding) {
      position.address = this._addressBinding.getAddresses();
    }
    if (this._imageId) {
      position.imageId = this._imageId
    }
    if (this._additionalInfo) {
      position.additionalInfo = this._additionalInfo
    }

    position.voucherLayout = this._voucherLayout;

    return position;
  }

  /**
   * @returns {number}
   */
  getPrice() {
    return this._price;
  }
}

module.exports = Position;
