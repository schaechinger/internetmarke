const AddressFactory = require('./AddressFactory')
  PartnerFactory = require('./PartnerFactory'),
  UserFactory = require('./UserFactory');

const factory = {
  createAddress: AddressFactory.create,
  bindAddress: AddressFactory.bind,

  createPartner: PartnerFactory.create,

  createUser: UserFactory.create
};

module.exports = factory;
