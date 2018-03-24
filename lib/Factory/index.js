/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const AddressFactory = require('./AddressFactory'),
  ClientFactory = require('./ClientFactory'),
  PartnerFactory = require('./PartnerFactory'),
  UserFactory = require('./UserFactory');

const factory = {
  createAddress: AddressFactory.create,
  bindAddress: AddressFactory.bind,

  createClient: ClientFactory.create,
  createPartner: PartnerFactory.create,

  createUser: UserFactory.create
};

module.exports = factory;
