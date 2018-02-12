const soap = require('soap'),
  path = require('path');

const errors = require('./errors'),
  Gallery = require('./Gallery'),
  Order = require('./Order'),
  Partner = require('./Partner'),
  User = require('./User');

const { LAYOUT_ZONES, OUTPUT_FORMATS, WSDL } = require('./constants');

const _PARTNER = Symbol('partner'),
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
    this._config = {
      outputFormat: OUTPUT_FORMATS.PNG,
      voucherLayout: LAYOUT_ZONES.ADDRESS
    };
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
   * Add another stamp to the order list.
   * 
   * @param {Object} position
   * @param {number} position.productCode - The product code of the voucher.
   * @param {string} [position.voucherLayout] - The layout of the voucher.
   */
  orderVoucher({ productCode, voucherLayout = this._config.voucherLayout }) {
    this._order.addPosition({ productCode, voucherLayout });
  }

  /**
   * Checkout the order list. This is where your wallet will be charged!
   * 
   * @param {Object} options
   * @param {number} [options.orderId] - A unique order id if your system
   *   requires a specific one.
   * @returns {Promise.Object} - The shopping cart with the link to the zip
   *   archive, the order id and the coucher ids.
   */
  checkout({ orderId = null } = {}) {
    const method = `checkoutShoppingCart${this._config.outputFormat}Async`;
    let orderIdPromise = Promise.resolve(orderId);
    if (!orderId) {
      orderIdPromise = this._generateOrderId();
    }

    return orderIdPromise.then(orderId => {
      return this._getSoapClient()
        .then(client => {
          let order = this._order.checkout({ orderId });
          if (!order) {
            return false;
          }
          if (order.total > this[_USER].getWalletBalance()) {
            throw Error(errors.internetmarke.walletEmpty);
          }

          order = Object.assign(this[_USER].getToken(), order);
          
          return client[method](order)
            .then(response => {
              this[_USER].updateWalletBalance(response.walletBallance || response.walletBalance);

              const result = {
                orderId: response.shoppingCart.shopOrderId,
                link: response.link,
                vouchers: []
              };

              response.shoppingCart.voucherList.voucher.forEach(voucher => {
                const data = { id: voucher.voucherId };
                if (voucher.trackId) {
                  data.trackingCode = voucher.trackId;
                }
                result.vouchers.push(data);
              });
              
              this[_USER].addOrderId(result.orderId);

              return result;
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
   * @param {number} preview.productCode - The product code as defined from
   *   the API.
   * @param {number} [preview.imageId] - The id of the image that should be
   *   printed next to the stamp.
   * @returns {Promise.string} - The url of the preview stamp.
   */
  getStampPreview({ productCode, imageId = null }) {
    const method = `retrievePreviewVoucher${outputFormat}Async`;

    return this._getSoapClient()
      .then(client => {
        return client[method]({
          productCode,
          voucherLayout
        })
          .then(response => {
            return response.link;
          })
          .catch(reason => {
            console.log('error during preview', reason, client.lastRequest);
          });
      });
  }

  /**
   * Specify the layout of the stamps from the LAYOUT_ZONES enum.
   * 
   * @param {string} voucherLayout - The layout that should be used.
   */
  setVoucherLayout(voucherLayout) {
    const valid = -1 !== Object.values(LAYOUT_ZONES).indexOf(voucherLayout);

    if (valid) {
      this._config.voucherLayout = voucherLayout;
    }

    return valid;
  }

  /**
   * Update galleries (public and private) and save results locally.
   * 
   * @returns {Promise.boolean[]}
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

  /**
   * Create a globally unique order id from the api.
   * 
   * @returns {Promise.number}
   */
  _generateOrderId() {
    return this._getSoapClient()
      .then(client => {
        return client.createShopOrderIdAsync(this[_USER].getToken())
          .then(response => {
            return this[_USER].getOrderId();
          })
          .catch(reason => {
            console.log('error during order id', reason, client.lastRequest);
          });
      });
  }
}

Internetmarke.OUTPUT_FORMATS = OUTPUT_FORMATS;
Internetmarke.LAYOUT_ZONES = LAYOUT_ZONES;

module.exports = Internetmarke;
