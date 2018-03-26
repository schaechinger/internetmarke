const Product = require('../../lib/ProductList/Product');

const TEST_DATA = require('./Product.data.json');

describe('Product', () => {
  it('should create a new product', () => {
    const product = new Product();
    
    product.isValid().should.be.false();
  });

  describe('readData', () => {
    it('should deny reading data if invalid', () => {
      TEST_DATA.data.invalid.forEach(data => {
        const product = new Product(data);

        product.isValid().should.be.false();
      });
    });

    it('should load given the data', () => {
      TEST_DATA.data.valid.forEach(data => {
        const product = new Product(data.raw);

        product.isValid().should.be.true();
        product.getId().should.equal(data.gen.id);
        product.getPrice().should.equal(data.gen.price);
        product.getName().should.equal(data.gen.name);
        product._dimensions.should.have.properties('length', 'width', 'height');
        product._dimensions.length.should.have.length(2);
        product._weight.should.have.length(2);
        product._ppl.should.equal(data.gen.ppl);
      });
    });

    it('should skip optional information if not given', () => {
      TEST_DATA.data.skipOptional.forEach(data => {
        const product = new Product(data.raw);

        product.isValid().should.be.true();
        product._dimensions.should.be.empty();
        product._weight.should.be.empty;
      });
    });
  });
});
