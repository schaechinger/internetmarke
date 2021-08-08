'use strict';

require('reflect-metadata');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

module.exports = {
  timeout: 3000,
  recursive: true,
};
