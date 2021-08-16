import { expect } from 'chai';
import { parseOrder } from '../../../src/1c4a/order';
import { Voucher } from '../../../src/Internetmarke';

describe('order', () => {
  const vouchers: Voucher[] = [
    {
      voucherId: 'A1234'
    },
    {
      voucherId: 'A1235'
    }
  ];
  let data: any;

  beforeEach(() => {
    data = {
      link: 'http://localhost/order-12345',
      shoppingCart: {
        shopOrderId: 1234,
        voucherList: {
          voucher: []
        }
      }
    };
  });

  it('should detect invalid orders', () => {
    [
      null,
      {},
      {
        INVALID: {
          id: 1
        }
      }
    ].forEach(invalid => {
      expect(parseOrder(invalid)).to.not.exist;
    });
  });

  it('should parse a valid order response', () => {
    data.shoppingCart.voucherList.voucher = vouchers;
    const order = parseOrder(data);

    expect(order).to.exist;
    if (order) {
      expect(order.link).to.equal(data.link);
      expect(order.shoppingCart.shopOrderId).to.equal(data.shoppingCart.shopOrderId);
      expect(order.shoppingCart.vouchers).to.have.length(vouchers.length);
      order.shoppingCart.vouchers.forEach((voucher, i) => {
        expect(voucher.voucherId).to.equal(vouchers[i].voucherId);
      });
      expect(order.manifestLink).to.not.exist;
    }
  });

  it('should parse an order with manifest', () => {
    data.shoppingCart.voucherList.voucher = vouchers;
    const manifestLink = 'http://localhost/manifest-12345';
    data.manifestLink = manifestLink;
    const order = parseOrder(data);

    expect(order).to.exist;
    if (order) {
      expect(order.manifestLink).to.equal(manifestLink);
    }
  });
});
