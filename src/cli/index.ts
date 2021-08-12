#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { checkout } from './checkout';

enum Command {
  Checkout = 'checkout',
  Product = 'product',
  PageFormat = 'page-format',
  Gallery = 'gallery'
}

const options: any = {
  p: {
    alias: 'product-code',
    describe: 'The product code of the voucher as defined in ProdWS',
    type: 'number',
    demandOption: true
  },
  l: {
    alias: 'layout',
    describe: 'The voucher layout',
    choices: ['AddressZone', 'FrankingZone'],
    type: 'string',
    demandOption: true
  },
  f: {
    alias: 'page-format',
    describe: 'The page format id',
    type: 'number'
  },
  i: {
    alias: 'image',
    describe: 'The image id of the gallery item',
    type: 'number'
  },
  U: {
    alias: 'user',
    type: 'string'
  },
  P: {
    alias: 'partner',
    type: 'string'
  },
  C: {
    alias: 'client',
    type: 'string'
  }
};

const getOptions = (...params: string[]): any => {
  const o: any = {};

  params.forEach(p => {
    let required = false;
    if (p.endsWith('!')) {
      required = true;
      p = p.substr(0, p.length - 1);
    }

    if (options[p]) {
      o[p] = { ...options[p] };
      if (required) {
        o[p].demandOption = true;
      }
    }
  });

  return o;
};

const args = yargs(hideBin(process.argv))
  .command(Command.Checkout, 'Checkout the given voucher', getOptions('p!', 'l!', 'f', 'i'))
  .command(Command.Product, 'Retrieve product details', getOptions('p'))
  .command(Command.PageFormat, 'Retrieve page format details', getOptions('f'))
  .command(Command.Gallery, 'Retrieve page format details', getOptions('i'))
  .options(getOptions('C', 'P', 'U'))
  .env('INTERNETMARKE')
  .alias('h', 'help')
  .alias('v', 'version')
  .locale('en')
  .demandCommand()
  .help()
  .parseSync();

const command = args._[0] as Command;

switch (command) {
  case Command.Checkout:
    checkout(args);
    break;

  case Command.Product:
    break;

  case Command.PageFormat:
    break;

  case Command.Gallery:
    break;

  default:
    break;
}
