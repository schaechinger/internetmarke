const AddressBindung = require('../Address/AddressBindung');

class Position {
  constructor({ productCode, voucherLayout, addressBinding = null,
    imageId = null, additionalInfo = null }) {
    /** @type {number} */
    this._productCode = productCode;
    /** @type {string} */
    this._voucherLayout = voucherLayout;
    /** @type {AddressBindung} */
    this._addressBinding = addressBinding;
    /** @type {number} */
    this._imageId = imageId;
    /** @type {(string|null)} */
    this._additionalInfo = additionalInfo;

    // TODO: lookup product and update price
    /** @type {number} */
    this._amount = 70;
  }

  getPosition() {
    const position = {
      productCode: this._productCode,
      voucherLayout: this._voucherLayout
    };
    if (this._addressBinding) {
      // TODO: convert addresses to object
    }
    if (this._imageId) {
      position.imageId = this._imageId
    }
    if (this._additionalInfo) {
      position.additionalInfo = this._additionalInfo
    }

    return position;
  }

  /**
   * @returns {number}
   */
  getAmount() {
    return this._amount;
  }
}

module.exports = Position;
