const factory = require('../../lib/Address/AddressFactory'),
  Address = require('../../lib/Address'),
  AddressBinding = require('../../lib/Address/AddressBinding');

describe('Address Factory', () => {
  describe('Address', () => {
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
      address.getData().should.have.property('name').and.property('companyName');
    });

    it('should create a person named address', () => {
      const address = factory.create({
        street: 'Marienplatz',
        firstname: 'Max',
        lastname: 'Müller'
      });

      address.isNamed().should.be.true();
      address.getData().should.have.property('name').and.property('personName');
    });
  });

  describe('Address Biding', () => {
    it('should bind to addresses', () => {
      const addressBinding = factory.bind({
        sender: new Address({}),
        receiver: new Address({})
      });

      addressBinding.should.be.an.instanceof(AddressBinding);
    });
  });
});
