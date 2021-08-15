import { expect } from 'chai';
import { accessSync, readFileSync } from 'fs';
import moxios from 'moxios';
import { join as joinPath } from 'path';
import { sync as rmdirSync } from 'rimraf';
import { downloadOrder, getBasePath } from '../../../src/1c4a/download';
import { Order } from '../../../src/1c4a/order';
import { Voucher } from '../../../src/1c4a/voucher';

describe('download', () => {
  const vouchers: Voucher[] = [
    {
      voucherId: 'A1234'
    },
    {
      voucherId: 'A1235'
    }
  ];
  const url = 'http://localhost/download-order-1234';
  const basePath = getBasePath();
  let order: Order;

  beforeEach(() => {
    moxios.install();

    order = {
      link: url,
      shoppingCart: {
        shopOrderId: 1234,
        voucherList: {
          voucher: []
        }
      }
    };
  });

  afterEach(() => {
    moxios.uninstall();

    try {
      rmdirSync(basePath);
    } catch (e) {
      // no temp file available
    }
  });

  describe('zip / png', () => {
    it('should download an archive', async () => {
      const filename = 'INTERNETMARKEN.zip';
      moxios.stubOnce('get', /order-1234$/, {
        status: 200,
        headers: {
          'content-disposition': `attachment; filename=${filename}`,
          'content-type': 'application/zip'
        },
        response: readFileSync(joinPath(__dirname, 'data', filename))
      });

      order.shoppingCart.voucherList.voucher = vouchers;
      const links = await downloadOrder(order);

      expect(links).to.exist;
      const keys = Object.keys(links);
      expect(keys).to.have.length(vouchers.length);
      vouchers.forEach(({ voucherId }, i) => {
        expect(keys[i]).to.equal(voucherId);

        const linkPath = links[keys[i]];
        expect(linkPath).to.equal(joinPath(basePath, `${keys[i]}.png`));
        expect(() => accessSync(linkPath)).to.not.throw();
      });

      expect(() => accessSync(joinPath(basePath, filename))).to.throw();
    });

    it('should keep the archive after extraction', async () => {
      const filename = 'INTERNETMARKEN.zip';
      moxios.stubOnce('get', /order-1234$/, {
        status: 200,
        headers: {
          'content-disposition': `attachment; filename=${filename}`,
          'content-type': 'application/zip'
        },
        response: readFileSync(joinPath(__dirname, 'data', filename))
      });

      order.shoppingCart.voucherList.voucher = vouchers;
      const links = await downloadOrder(order, { deleteArchive: false });

      expect(links).to.exist;

      expect(() =>
        accessSync(joinPath(basePath, `im-${order.shoppingCart.shopOrderId}.zip`))
      ).to.not.throw();
    });

    it('should not extract the archive', async () => {
      const filename = 'INTERNETMARKEN.zip';
      moxios.stubOnce('get', /order-1234$/, {
        status: 200,
        headers: {
          'content-disposition': `attachment; filename=${filename}`,
          'content-type': 'application/zip'
        },
        response: readFileSync(joinPath(__dirname, 'data', filename))
      });

      order.shoppingCart.voucherList.voucher = vouchers;
      const links = await downloadOrder(order, { deleteArchive: false });

      expect(links).to.exist;

      expect(() =>
        accessSync(joinPath(basePath, `im-${order.shoppingCart.shopOrderId}.zip`))
      ).to.not.throw();
    });
  });

  describe('pdf', () => {
    it('should download a document with one voucher', async () => {
      const filename = 'Briefmarken.1Stk.15.08.2021_1521.pdf';
      moxios.stubOnce('get', /order-1234$/, {
        status: 200,
        headers: {
          'content-disposition': `attachment; filename=${filename}`,
          'content-type': 'application/pdf'
        },
        response: readFileSync(joinPath(__dirname, 'data', filename))
      });

      order.shoppingCart.voucherList.voucher = [vouchers[0]];
      const links = await downloadOrder(order);

      expect(links).to.exist;
      const keys = Object.keys(links);
      expect(keys).to.have.length(1);

      expect(keys[0]).to.equal(vouchers[0].voucherId);

      const linkPath = links[keys[0]];
      expect(linkPath).to.equal(joinPath(basePath, `${keys[0]}.pdf`));
      expect(() => accessSync(linkPath)).to.not.throw();

      expect(() => accessSync(joinPath(basePath, filename))).to.throw();
    });

    it('should download a document with multiple vouchers', async () => {
      const filename = 'Briefmarken.1Stk.15.08.2021_1521.pdf';
      moxios.stubOnce('get', /order-1234$/, {
        status: 200,
        headers: {
          'content-disposition': `attachment; filename=${filename}`,
          'content-type': 'application/pdf'
        },
        response: readFileSync(joinPath(__dirname, 'data', filename))
      });

      order.shoppingCart.voucherList.voucher = vouchers;
      const links = await downloadOrder(order);

      expect(links).to.exist;
      const keys = Object.keys(links);
      expect(keys).to.have.length(2);

      expect(keys[0]).to.equal(vouchers[0].voucherId);

      const linkPath = links[keys[0]];
      expect(linkPath).to.equal(joinPath(basePath, `im-${order.shoppingCart.shopOrderId}.pdf`));
      expect(() => accessSync(linkPath)).to.not.throw();
    });
  });
});
