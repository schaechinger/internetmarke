/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

module.exports = {
  soap: {

  },

  internetmarke: {
    showTermsAndCondition: '2001: Please accept the terms and conditions to use the Internetmarke service!',
    walletEmpty: '2002: Your wallet is empty or there is not enough credit to perform the checkout!',
    shoppingcartEmpty: '2003: You cannot checkout wihout having ordered any vouchers.'
  },

  usage: {
    missingUserCredentials: '3001: Missing user credentials (username & password)!',
    invalidCountryCode: '3002: Invalid country code for address given: ',
    missingAddressBindings: '3003: Please add receiver and sender to address binding!',
    missingPartnerCredentials: '3004: The api requires valid partner credentials including the id and the secret!',
    missingPositionParameters: '3005: A position requires at least the product or productCode and a voucherLayout!',
    invalidLayoutZone: '3006: Invalid voucher layout given: ',
    missingProductClients: '3007: The product client credentials are required to make use of the product list. Please add credentials with internetmarke.enableProductList!',
    missingClientCredentials: '3008: The api requires valid client credentials including the username and password!'
  }
};
