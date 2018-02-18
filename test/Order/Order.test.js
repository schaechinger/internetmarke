const Order = require('../../lib/Order');

describe('Order', () => {
  const POSITIONS = [
    {
      productCode: 1,
      voucherLayout: 'Franking',
      price: 70
    },
    {
      productCode: 2,
      voucherLayout: 'Address',
      price: 80
    }
  ];
  const ORDER_ID = 1234;

  it('should add positions to the current order', () => {
    const order = new Order();

    POSITIONS.forEach((position, i) => {
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

  it('should not checkout without an order id', () => {
    const order = new Order();

    order.checkout().should.be.false();
  });

  it('should not checkout without any positions', () => {
    const order = new Order();

    order.checkout({ orderId: ORDER_ID }).should.be.false();
  });


  it('should checkout with a summary', () => {
    const order = new Order();

    POSITIONS.forEach(position => {
      order.addPosition(position);
    });

    const summary = order.checkout({
      orderId: ORDER_ID,
      createManifest: false,
      createShippingList: 1
    });

    summary.should.be.ok();
    summary.shopOrderId.should.equal(ORDER_ID);
    summary.positions.should.be.an.Array();
    summary.positions.should.have.length(2);
    summary.total.should.equal(150);
    summary.createManifest.should.be.false();
    summary.createShippingList.should.equal(1);
  });
});
