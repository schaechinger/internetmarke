const soap = require('soap');

const WSDL = 'https://internetmarke.deutschepost.de/OneClickForAppV3?wsdl';

class Internetmarke {
  /**
   * The main class of the module that holds the public methods to generate stamps.
   * 
   * @constructor
   */
  constructor() {
    this._init();
  }

  /**
   * @param {string} username - The email address of the user account.
   * @param {string} password - The corresponding password of the account.
   * 
   * @returns {Promise}
   */
  authenticate({ username, password }) {
    return this._soap.then(client => {
      return client.authenticateUser({
        AuthenticateUserRequest: { username, password }
      });
    })
      .then(result => {
        // TODO: save token for further requests
        return true;
      });
  }

  _init() {
    this._soap = soap.createClientAsync(WSDL, {
      disableCache: true
    })
      .catch(reason => {
        console.log('ERROR', reason);
      });
  }
}

module.exports = Internetmarke;
