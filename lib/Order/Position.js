class Position {
  constructor({ productCode, voucherLayout, addressBinding = null,
    imageId = null, additionalInfo = null }) {
    this._productCode = productCode;
    this._voucherLayout = voucherLayout;
    this._addressBinding = addressBinding;
    this._imageId = imageId;
    this._additionalInfo = additionalInfo;

    // TODO: lookup product and update price
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
