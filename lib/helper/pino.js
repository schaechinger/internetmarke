/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

let level = 'info';

switch (process.env.NODE_ENV) {
  case 'test':
  case 'production':
    level = 'error';
    break;

  default:
    level = 'info';
    break;
}

module.exports = require('pino')({
  prettyPrint: true,
  level
});
