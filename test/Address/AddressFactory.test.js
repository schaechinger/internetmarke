const factory = require('../../lib/Address/AddressFactory');

describe('Address Factory', () => {
  it('should create an address', () => {
    const address = factory.create({
      street: 'Marienplatz'
    });

    address.isNamed().should.be.false();
  });

  it('should create a person named address', () => {
    const address = factory.create({
      street: 'Marienplatz',
      company: 'BMW'
    });

    address.isNamed().should.be.true();
    address.getData();
  });

  it('should create company named address', () => {
    const address = factory.create({
      street: 'Marienplatz'
    });

    address.isNamed().should.be.false();
  });
});
