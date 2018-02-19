const AddressBinding = require('../../lib/Address/AddressBinding'),
  Address = require('../../lib/Address');

describe('Address Binding', () => {
  it('should connect two addresses', () => {
    const sender = new Address({});
    const receiver = new Address({});

    const binding = new AddressBinding({ receiver, sender });

    const addresses = binding.getAddresses();
    addresses.should.have.keys('sender', 'receiver');
  });
});
