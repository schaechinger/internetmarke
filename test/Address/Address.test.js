const Address = require('../../lib/Address'),
  errors = require('../../lib/errors');

describe('Address', () => {
  it('should validate the country code', () => {
    [
      'DEU',
      'MEX'
    ].forEach(country => {
      const address = new Address({ country });
      address._country.should.equal(country);
    });
    
    const address = new Address({ country: null });
    address._country.should.equal('DEU');
  });

  it('should reject invalid country codes', () => {
    const INVALID_CODE = 'INVALID';
    (() => {
      new Address({ country: INVALID_CODE });
    }).should.throw(errors.usage.invalidCountryCode + INVALID_CODE);
  });

  it('should convert address data of normal addresses', () => {
    const address = new Address({
      street: 'Marienplatz',
      houseNo: '1',
      zip: '80331',
      city: 'München'
    });

    address.isNamed().should.be.false();

    const data = address.getData();
    data.should.have.property('address');
    data.should.not.have.property('name');
    data.address.should.have.keys('street', 'houseNo', 'zip', 'city', 'country');
    data.address.should.not.have.property('additional');
  });
});
