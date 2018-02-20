const AddressBinding = require('../../lib/Address/AddressBinding'),
  Address = require('../../lib/Address'),
  errors = require('../../lib/errors');

describe('Address Binding', () => {
  it('should connect two addresses', () => {
    const sender = new Address({});
    const receiver = new Address({});

    const binding = new AddressBinding({ receiver, sender });

    const addresses = binding.getAddresses();
    addresses.should.have.keys('sender', 'receiver');
  });

  it('should require sender and receiver', () => {
    [
      {},
      { sender: new Address({}) },
      { receiver: new Address({}) }
    ].forEach(args => {
      (( )=> {
        new AddressBinding(args);
      }).should.throw(errors.usage.missingAddressBindings);
    });
  });
});
