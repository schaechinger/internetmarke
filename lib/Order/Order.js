const Position = require('./Position');

class Order {
  constructor({ orderId = null } = {}) {
    this._orderId = orderId;
    this._positions = [];
  }

  addPosition({ productCode, voucherLayout }) {
    this._positions.push(new Position({ productCode, voucherLayout }));
  }

  /**
   * Checkout the complete order and convert the data into the api format.
   * Checkout requires an order id.
   * 
   * @param {Object} metadata
   * @param {boolean} [metadata.createManifest]
   * @param {number} [metadata.createShippingList] - Determine whether a shipping
   *   list should be created: 0: no, 1: without addresses, 2: with addresses
   * @returns {(Object|boolean)}
   */
  checkout({ orderId = this.orderId, createManifest = true, createShippingList = 2 } = {}) {
    if (!orderId || !this._positions.length) {
      return false;
    }

    const positions = [];
    let total = 0;

    this._positions.forEach(pos => {
      total += pos.getAmount();

      positions.push(pos.getPosition());
    });

    return {
      shopOrderId: orderId,
      //ppl: 33,
      positions,
      total,
      createManifest,
      createShippingList
    };
  }
}

module.exports = Order;
