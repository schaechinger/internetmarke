'use strict';

require('reflect-metadata');

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

module.exports = {
  timeout: 3000,
  recursive: true,
};
