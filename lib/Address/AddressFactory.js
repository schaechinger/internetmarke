const Address = require('./'),
  { CompanyName, PersonName } = require('./Name');

/**
 * Used to create an address object with optional company or person name.
 * 
 * @param {Object} data
 * @param {string} data.street - The street name of the address.
 * @param {string} data.houseNo - The house number of the address.
 * @param {string} data.zip - The ZIP code of the address.
 * @param {string} data.city - The name of the city.
 * @param {string} [data.country] - The country in ISO 3166 alpha-3 format.
 *   Default is DEU / Germany.
 * @param {string} [data.additional] - Additional information about the address.
 * @param {string} [data.company] - The name of the company.
 * @param {string} [data.firstname] - The first name of the receiver.
 * @param {string} [data.lastname] - The last name of the receiver.
 * @param {string} [data.title] - The receiver's title if available.
 * @param {string} [data.salutation] - The salutation that fits the receiver.
 * @returns {Address}
 */
function create(data) {
  const address = new Address(data);

  if (data.company) {
    address.setName(new CompanyName(data));
  }
  else if (data.firstname) {
    address.setName(new PersonName(data));
  }

  return address;
}

module.exports = { create };
