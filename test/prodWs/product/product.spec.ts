import { expect } from 'chai';

import { DinEnvelope, DinPaper } from '../../../src/Internetmarke';
import { matchProduct, parseSalesProduct } from '../../../src/prodWs/product';
import { invalidProducts, productList, validProducts } from './product.data';

describe('Product', () => {
  it('should detect invalid products', () => {
    invalidProducts.forEach(data => {
      expect(parseSalesProduct(data)).to.be.null;
    });
  });

  it('should parse a product', () => {
    validProducts.forEach(data => {
      const product = parseSalesProduct(data);

      expect(product).to.exist;
    });
  });

  describe('matchProduct', () => {
    it('should match a product for a single DIN A4 paper in DIN Lang envelope', () => {
      const product = matchProduct(productList, { pages: 1 })!;

      expect(product).to.exist;
      expect(product.id).to.equal(1);
    });

    it('should match a product for five DIN A4 papers in DIN Lang envelope', () => {
      const product = matchProduct(productList, { pages: 5 })!;

      expect(product).to.exist;
      expect(product.id).to.equal(11);
    });

    it('should match a product for five DIN A5 papers in DIN Lang envelope', () => {
      const product = matchProduct(productList, { pages: 5, paper: DinPaper.DinA5 })!;

      expect(product).to.exist;
      expect(product.id).to.equal(1);
    });

    it('should match a product for a single DIN A4 paper in DIN C4 envelope', () => {
      const product = matchProduct(productList, { pages: 5, envelope: DinEnvelope.DinC4 })!;

      expect(product).to.exist;
      expect(product.id).to.equal(21);
    });

    xit('should match a product for post cards', () => {
      const product = matchProduct(productList, {
        pages: 1,
        paper: { format: DinPaper.DinA6, grammage: 150 },
        envelope: DinEnvelope.None
      })!;

      expect(product).to.exist;
      expect(product.id).to.equal(51);
    });

    it('should match a product with priority label', () => {
      const product = matchProduct(productList, { pages: 1, priority: true })!;

      expect(product).to.exist;
      expect(product.id).to.equal(195);
    });

    it('should match a product with registered label', () => {
      const product = matchProduct(productList, { pages: 1, registered: true })!;

      expect(product).to.exist;
      expect(product.id).to.equal(1002);
    });

    it('should match a product for an abroad letter', () => {
      const product = matchProduct(productList, { pages: 1, domestic: false })!;

      expect(product).to.exist;
      expect(product.id).to.equal(10001);
    });
  });
});
