const soap = require('soap'),
  path = require('path');

const errors = require('./errors'),
  Gallery = require('./Gallery'),
  Order = require('./Order'),
  Partner = require('./Partner'),
  User = require('./User'),
  { LAYOUT_ZONES, OUTPUT_FORMATS, WSDL } = require('./constants');

const _PARTNER = Symbol('partner'),
  _SOAP = Symbol('soap'),
  _USER = Symbol('user');

class Internetmarke {
  /**
   * The main class of the module that holds the public methods to generate vouchers.
   * 
   * @constructor
   * @param {Partner} partner - The partner object that should be used for
   *   every request.
   */
  constructor(partner) {
    this[_PARTNER] = partner;
    /** @type {(Client|null)} */
    this[_SOAP] = null;
    /** @type {(User|null)} */
    this[_USER] = null;

    /** @type {Gallery} */
    this._gallery = new Gallery();
    /** @type {Order} */
    this._order = new Order();
    /** @type {Object} */
    this._config = {
      outputFormat: OUTPUT_FORMATS.PNG,
      voucherLayout: LAYOUT_ZONES.ADDRESS
    };
  }

  /**
   * @param {User} user - the user object that should be authenticated.
   * @returns {Promise.<Internetmarke>}
   */
  authenticateUser(user) {
    this[_USER] = user;

    return this._getSoapClient()
      .then(client => {
        return client.authenticateUserAsync(this[_USER].getCredentials())
      })
      .then(response => {
        if (response) {
          this[_USER].setToken(response.userToken)
            .setBalance(response.walletBalance)
            .setTerms(response.showTermAndCondition)
            .setInfoMessage(response.infoMessage || null);
        }

        return this;
      })
      .catch(reason => {
        // TODO: check error type and message
        // throw error error.internetmarke.invalidUserCredentials

        // OperationalError {cause: Error: ns2:Server: Unknown user or invalid passwor…, isOperational: true, root: Object, response: IncomingMessage, body: "<?xml version='1....
      });
  }

  /**
   * Add another voucher to the order list.
   * 
   * @param {Object} position
   * @param {number} position.productCode - The product code of the voucher.
   * @param {number} position.price - The price of the product that should be
   *   order for security reasons.
   * @param {string} [position.voucherLayout] - The layout of the voucher.
   * @returns {Internetmarke}
   */
  orderVoucher({ productCode, price, voucherLayout = this._config.voucherLayout }) {
    this._order.addPosition({ productCode, voucherLayout, price });

    return this;
  }

  /**
   * Checkout the order list. This is where your wallet will be charged!
   * 
   * @param {Object} options
   * @param {number} [options.orderId] - A unique order id if your system
   *   requires a specific one.
   * @returns {Promise.<Object>} - The shopping cart with the link to the zip
   *   archive, the order id and the coucher ids.
   */
  checkout({ orderId = null } = {}) {
    const method = `checkoutShoppingCart${this._config.outputFormat}Async`;
    let orderIdPromise = Promise.resolve(orderId);
    if (!orderId) {
      orderIdPromise = this._generateOrderId();
    }

    let checkoutOrderId = orderId;

    return orderIdPromise.then(orderId => {
      checkoutOrderId = orderId;

      return this._getSoapClient();
    })
      .then(client => {
        let order = this._order.checkout({ orderId: checkoutOrderId });
        if (!order) {
          throw new Error(errors.internetmarke.shoppingcartEmpty);
        }
        if (order.total > this[_USER].getBalance()) {
          throw new Error(errors.internetmarke.walletEmpty);
        }

        order = Object.assign({
          userToken: this[_USER].getToken()
        }, order);

        return client[method](order);
      })
      .then(response => {
        this[_USER].setBalance(response.walletBallance || response.walletBalance);

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

        return result;
      });
  }

  /**
   * Generate a preview of a voucher.
   * 
   * @param {Object} preview
   * @param {number} preview.productCode - The product code as defined from
   *   the API.
   * @param {number} [preview.imageId] - The id of the image that should be
   *   printed next to the voucher.
   * @returns {Promise.<Object>} - The url of the preview voucher.
   */
  getVoucherPreview({ productCode, imageId = null }) {
    const method = `retrievePreviewVoucher${this._config.outputFormat}Async`;

    return this._getSoapClient()
      .then(client => {
        return client[method]({
          productCode,
          voucherLayout
        })
      })
      .then(response => {
        return {
          link: response.link
        };
      });
  }

  /**
   * Specify the layout of the voucher from the LAYOUT_ZONES enum.
   * 
   * @param {string} voucherLayout - The layout that should be used.
   * @returns {boolean}
   */
  setDefaultVoucherLayout(voucherLayout) {
    let valid = false;
    for (const key in LAYOUT_ZONES) {
      if (LAYOUT_ZONES.hasOwnProperty(key) && voucherLayout === LAYOUT_ZONES[key]) {
        valid = true;
      }
    }

    if (valid) {
      this._config.voucherLayout = voucherLayout;
    }

    return valid;
  }

  /**
   * Update galleries (public and private) and save results locally.
   * 
   * @returns {Promise.<boolean[]>}
   */
  updateGalleries() {
    return this._gallery.updateGalleries(this._getSoapClient());
  }

  /**
   * Helper method to retrieve the soap client for every api call.
   * 
   * @returns {Promise.<Client>}
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

            if (this[_PARTNER]) {
              client.addSoapHeader(this[_PARTNER].getSoapHeaders());
            }

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
        return client.createShopOrderIdAsync({
          userToken: this[_USER].getToken()
        })
      })
      .then(response => {
        this[_USER].addOrderId(response.shopOrderId);

        return response.shopOrderId;
      });
  }
}

Internetmarke.Partner = Partner;
Internetmarke.User = User;

Internetmarke.OUTPUT_FORMATS = OUTPUT_FORMATS;
Internetmarke.LAYOUT_ZONES = LAYOUT_ZONES;

module.exports = Internetmarke;
