import { expect } from 'chai';

import { parseSalesProduct } from '../../../src/prodWs/product';
import { invalidProducts, validProducts } from './product.data';

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
});
