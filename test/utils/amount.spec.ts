import { expect } from 'chai';

import { amountToCents, parseAmount } from '../../src/utils/amount';

describe('Amount', () => {
  describe('parsAmount', () => {
    it('should parse cents to amount', () => {
      const amount = parseAmount(1234);

      expect(amount.value).to.equal(12.34);
      expect(amount.currency).to.equal('EUR');
    });

    it('should ignore amount as parameter', () => {
      const amount = parseAmount({ value: 12.34, currency: 'EUR' });

      expect(amount.value).to.equal(12.34);
      expect(amount.currency).to.equal('EUR');
    });
  });

  describe('amountToCents', () => {
    it('should convert an amount to cents', () => {
      const cents = amountToCents({ value: 12.34, currency: 'EUR' });

      expect(cents).to.equal(1234);
    });

    it('should ignore cents as parameter', () => {
      const cents = amountToCents(1234);

      expect(cents).to.equal(1234);
    });

    it('should ignore missing cents as parameter', () => {
      const cents = amountToCents();

      expect(cents).to.equal(0);
    });
  });
});
