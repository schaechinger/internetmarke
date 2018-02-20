const Position = require('../../lib/Order/Position'),
  errors = require('../../lib/errors');

const TEST_DATA = require('./Position.data.json');

describe('Position', () => {
  it('should create a position', () => {
    const POSITION = {
      productCode: 1,
      voucherLayout: 'AddressZone',
      price: 70,
      imageId: 5,
      addressBinding: {
        getAddresses: sinon.stub().returns({ name: 'fake address binding' })
      },
      additionalInfo: 'Test Product'
    };

    const position = new Position(POSITION);

    const pos = position.getPosition();
    pos.should.be.an.Object();
    pos.productCode.should.equal(POSITION.productCode);
    pos.voucherLayout.should.equal(POSITION.voucherLayout);
    pos.imageId.should.equal(POSITION.imageId);
    pos.address.should.have.property('name');
    POSITION.addressBinding.getAddresses.calledOnce.should.be.true();
    pos.additionalInfo.should.equal(POSITION.additionalInfo);
  });

  it('should require parameters', () => {
    TEST_DATA.invalid.forEach(args => {
      (() => {
        new Position(args);
      }).should.throw(errors.usage.missingPositionParameters);
    });
  });

  it('should remove addresses in franking layout zone', () => {
    TEST_DATA.frankingZoneAddress.forEach(args => {
      const position = new Position(args);
      should.not.exist(position._addressBinding);
    });
  });

  it('should detect invalid layout zones', () => {
    TEST_DATA.invalidLayoutZones.forEach(args => {
      (() => {
        new Position(args);
      }).should.throw(errors.usage.invalidLayoutZone + args.voucherLayout);
    });
  });
});
