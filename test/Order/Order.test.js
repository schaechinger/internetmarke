const Order = require('../../lib/Order'),
  errors = require('../../lib/errors');

const TEST_DATA = require('./Order.data.json');

describe('Order', () => {
  const ORDER_ID = 1234;

  it('should add positions to the current order', () => {
    const order = new Order();

    TEST_DATA.positions.forEach((position, i) => {
      order.addPosition(position);

      order._positions.should.have.length(i + 1);
      const pos = order._positions[order._positions.length - 1];
      
      for (const key in position) {
        if (position.hasOwnProperty(key)) {
          pos[`_${key}`].should.equal(position[key]);
        }
      }
    });
  });

  it('should not checkout without any positions', () => {
    const order = new Order();

    (() => {
      order.getCheckout({ orderId: ORDER_ID });
    }).should.throw(errors.internetmarke.shoppingcartEmpty)
  });

  it('should checkout with a summary', () => {
    const order = new Order();

    TEST_DATA.positions.forEach(position => {
      order.addPosition(position);
    });

    const summary = order.getCheckout({
      orderId: ORDER_ID,
      createManifest: false,
      createShippingList: 1
    });

    summary.should.be.ok();
    summary.shopOrderId.should.equal(ORDER_ID);
    summary.positions.should.be.an.Array();
    summary.positions.should.have.length(TEST_DATA.positions.length);
    summary.total.should.equal(TEST_DATA.total);
    summary.createManifest.should.be.false();
    summary.createShippingList.should.equal(1);
  });
});
