const Position = require('./Position');

class Order {
  /**
   * An order defines a set of positions / vouchers that can be checked out in
   * one step with a single order id.
   * 
   * @param {Object} data
   * @param {(number|string)} [data.orderId] - The order id that is linked to
   *   the position if known.
   */
  constructor({ orderId = null } = {}) {
    /** @type {(number|string)} */
    this._orderId = orderId;
    /** @type {Position[]} */
    this._positions = [];
  }

  /**
   * Add a position to the order.
   * 
   * @param {Object} position
   * @param {number} position.productCode - The product code that identifies
   *   the selected product.
   * @param {string} position.voucherLayout - The layout the voucher should be
   *   generated in.
   * @param {number} position.price - The price of the given product. This will
   *   be calculated by the product list api, soon.
   */
  addPosition({ productCode, voucherLayout, price }) {
    this._positions.push(new Position({ productCode, voucherLayout, price }));
    // TODO: generate a unique id to make the position removable
  }

  /**
   * Checkout the complete order and convert the data into the api format.
   * Checkout requires an order id.
   * 
   * @param {Object} metadata
   * @param {number} [metadata.orderId] - The order id if not defined, yet.
   * @param {boolean} [metadata.createManifest] - Determine whether a manifest
   *   should be generated and attached after checkout.
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
      total += pos.getPrice();

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
