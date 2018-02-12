const soap = require('soap'),
  fs = require('fs'),
  https = require('https'),
  path = require('path');

const errors = require('./errors'),
  Gallery = require('./Gallery'),
  Order = require('./Order'),
  Partner = require('./Partner'),
  User = require('./User');

const WSDL = 'https://internetmarke.deutschepost.de/OneClickForAppV3/OneClickForAppServiceV3?wsdl',
  OUTPUT_FORMATS = { PNG: 'PNG', PDF: 'PDF' },
  LAYOUT_ZONES = { FRANKING: 'FrankingZone', ADDRESS: 'AddressZone' },
  _PARTNER = Symbol('partner'),
  _SOAP = Symbol('soap'),
  _USER = Symbol('user');

class Internetmarke {
  /**
   * The main class of the module that holds the public methods to generate stamps.
   * 
   * @constructor
   * @param {Object} partner - The data to create a Partner object.
   * @param {string} partner.id - The partner id as specified in your account.
   * @param {string} partner.secret - The secret as specified in your account.
   * @param {number} [partner.keyPhase] - The key phase as specified in your account.
   */
  constructor({ id, secret, keyPhase = 1 }) {
    this[_PARTNER] = new Partner({ id, secret, keyPhase });
    this[_SOAP] = null;
    this[_USER] = null;

    this._gallery = new Gallery();
    this._order = new Order();
  }

  /**
   * @param {Object} user
   * @param {string} user.username - The email address of the user account.
   * @param {string} user.password - The corresponding password of the account.
   * 
   * @returns {Promise.Internetmarke} - Returns if the user credentials have been accepted.
   */
  authenticateUser({ username, password }) {
    this[_USER] = new User({ username, password });

    return this._getSoapClient()
      .then(client => {
        return client.authenticateUserAsync(this[_USER].getCredentials())
          .then(response => {
            if (response) {
              this[_USER].setToken(response.userToken)
                .updateWalletBalance(response.walletBalance)
                .setTerms(response.showTermAndCondition)
                .setInfoMessage(response.infoMessage || null);
            }

            return this;
          })
          .catch(reason => {
            // TODO: check error type and message
            // throw error error.internetmarke.invalidUserCredentials

            // OperationalError {cause: Error: ns2:Server: Unknown user or invalid passwor…, isOperational: true, root: Object, response: IncomingMessage, body: "<?xml version='1....

            console.log('error during auth', reason);
          });
      });
  }

  /**
   * Create a globally unique order code from the API.
   * 
   * @returns {Promise.Internetmarke}
   */
  createOrderId() {
    return this._getSoapClient()
      .then(client => {
        return client.createShopOrderIdAsync(this[_USER].getToken())
          .then(response => {
            this[_USER].addOrderId(response.shopOrderId);

            return this[_USER].getOrderId();
          })
          .catch(reason => {
            console.log('error during order id', reason, client.lastRequest);
          });
      });
  }

  /**
   * Add another stamp to the order list.
   * 
   * @param {Object} position
   * @param {number} position.productCode - The product code of the stamp.
   * @param {string} position.voucherLayout - The layout of the stamp.
   */
  orderStamp({ productCode, voucherLayout }) {
    this._order.addPosition({ productCode, voucherLayout });
  }

  /**
   * Checkout the order list. This is where your wallet will be charged!
   * 
   * @param {Object} options
   * @param {string} [options.outputFormat] - Specify the format of the stamps.
   */
  checkout({ outputFormat = OUTPUT_FORMATS.PNG } = {}) {
    const method = `checkoutShoppingCart${outputFormat}Async`;

    return this.createOrderId()
      .then(orderId => {
        return this._getSoapClient()
          .then(client => {
            let order = this._order.checkout({ orderId });
            if (!order) {
              return false;
            }
            order = Object.assign(this[_USER].getToken(), order);
            
            return client[method](order)
              .then(response => {
                console.log(response.shoppingCart);
                this[_USER].updateWalletBalance(response.walletBallance || response.walletBalance);

                var file = fs.createWriteStream(path.resolve(__dirname,
                  '../data/', orderId + '.zip'));
                var request = https.get(response.link, function (res) {
                  res.pipe(file);
                });
               // this[_USER].addOrderId(response.shopOrderId);

               return response.shoppingCart;
              })
              .catch(reason => {
                console.log('error during order id', reason, client.lastRequest);
              });
          });
      });
  }

  /**
   * Generate a preview of a stamp.
   * 
   * @param {Object} preview
   * @param {number} preview.productCode - The product code as defined from the API.
   * @param {number} [preview.imageId] - The id of the image that should be
   *   printed next to the stamp.
   * @param {number} [preview.outputFormat] - The format of the result (OUTPUT_FORMATS).
   * @param {number} [preview.voucherLayout] - The type of the layout (LAYOUT_ZONES).
   * @returns {Promise.Internetmarke}
   */
  getStampPreview({ productCode, imageId = null, outputFormat = OUTPUT_FORMATS.PNG,
    voucherLayout = LAYOUT_ZONES.ADDRESS }) {
    const method = `retrievePreviewVoucher${outputFormat}Async`;

    return this._getSoapClient()
      .then(client => {
        return client[method]({
          productCode,
          voucherLayout
        })
          .then(response => {
            // TODO: return url only
            var file = fs.createWriteStream(path.resolve(__dirname,
              '../data/', (orderId || +new Date()) +
              '.' + outputFormat.toLowerCase())
            );
            var request = https.get(response.link, function (res) {
              res.pipe(file);
            });

            return response.link;
          })
          .catch(reason => {
            console.log('error during preview', reason, client.lastRequest);
          });
      });
  }

  /**
   * Update galleries (public and private) and save results locally.
   * 
   * @returns {Promise}
   */
  updateGalleries() {
    return this._gallery.updateGalleries(this._getSoapClient());
  }

  /**
   * Helper method to retrieve the soap client for every api call.
   * 
   * @returns {Promise}
   */
  _getSoapClient() {
    let promise = null;

    if (this[_SOAP]) {
      promise = Promise.resolve(this[_SOAP]);
    }
    else {
      promise = new Promise(resolve => {
        soap.createClientAsync(WSDL, {
          disableCache: true
        })
          .then(client => {
            this[_SOAP] = client;

            client.addSoapHeader(this[_PARTNER].getSoapHeaders());

            resolve(client);
          });
        });
    }

    return promise;
  }
}

Internetmarke.OUTPUT_FORMATS = OUTPUT_FORMATS;
Internetmarke.LAYOUT_ZONES = LAYOUT_ZONES;

module.exports = Internetmarke;
