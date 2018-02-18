const Position = require('../../lib/Order/Position'),
  errors = require('../../lib/errors');

describe('Position', () => {
  const POSITION = {
    productCode: 1,
    voucherLayout: 'Franking',
    price: 70,
    imageId: 5,
    // addressBinding
    additionalInfo: 'Test Product'
  };

  it('should create a position', () => {
    const position = new Position(POSITION);

    const pos = position.getPosition();
    pos.should.be.an.Object();
    pos.productCode.should.equal(POSITION.productCode);
    pos.voucherLayout.should.equal(POSITION.voucherLayout);
    pos.imageId.should.equal(POSITION.imageId);
    pos.additionalInfo.should.equal(POSITION.additionalInfo);
  });

  it('should require parameters', () => {
    [
      {},
      { productCode: 1 },
      { voucherLayout: 'Address' }
    ].forEach(args => {
      (() => {
        new Position(args);
      }).should.throw(errors.usage.missingPositionParameters);
    });
  });
});
