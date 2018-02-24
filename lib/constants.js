/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

module.exports = {
  OUTPUT_FORMATS: {
    PNG: 'PNG',
    PDF: 'PDF'
  },
  LAYOUT_ZONES: {
    FRANKING: 'FrankingZone',
    ADDRESS: 'AddressZone'
  },
  WSDL: {
    '1C4A': 'https://internetmarke.deutschepost.de/OneClickForAppV3/OneClickForAppServiceV3?wsdl',
    PRODUCT: 'https://prodws.deutschepost.de:8443/ProdWSProvider_1_1/prodws?wsdl'
  }
};
