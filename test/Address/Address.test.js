const Address = require('../../lib/Address'),
  errors = require('../../lib/errors');

const TEST_DATA = require('./Address.data.json');

describe('Address', () => {
  describe('Country Code', () => {
    it('should validate the country code', () => {
      TEST_DATA.countryCode.valid.forEach(country => {
        const address = new Address({ country });
        country = country || Address.COUNTRY_CODES.DEFAULT;
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
  });

  it('should convert address data', () => {
    TEST_DATA.address.forEach(args => {
      const address = new Address(args);

      address.isNamed().should.be.false();

      const data = address.getData();
      
      data.should.have.property('address');
      data.address.should.containEql(args);
      data.address.should.have.property('country')
        .and.equal(args.country || Address.COUNTRY_CODES.DEFAULT);
      data.address.should.not.have.property('additional');

      data.should.not.have.property('name');
    });
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
