const Address = require('../../lib/Address'),
  errors = require('../../lib/errors');

const TEST_DATA = require('./Address.data.json');

describe('Address', () => {
  it('should validate the country code', () => {
    TEST_DATA.countryCode.valid.forEach(country => {
      const address = new Address({ country });
      country = country || 'DEU';
      address._country.should.equal(country);
    });
  });

  it('should reject invalid country codes', () => {
    TEST_DATA.countryCode.invalid.forEach(country => {
      (() => {
        new Address({ country });
      }).should.throw(errors.usage.invalidCountryCode + country);
    });
  });

  it('should convert address data of normal addresses', () => {
    const args = {
      street: 'Marienplatz',
      houseNo: '1',
      zip: '80331',
      city: 'München'
    };
    const address = new Address(args);

    address.isNamed().should.be.false();

    const data = address.getData();
    data.should.have.property('address');
    data.should.not.have.property('name');
    data.address.should.have.keys('street', 'houseNo', 'zip', 'city', 'country');
    data.address.should.containEql(args);
    data.address.country.should.equal('DEU');
    data.address.should.not.have.property('additional');
  });

  it('should add additional information', () => {
    const args = {
      street: 'Marienplatz',
      additional: 'Hinterhof'
    };
    const address = new Address(args);

    const data = address.getData();
    data.address.should.have.property('additional').and.equal(args.additional);
  });
});
