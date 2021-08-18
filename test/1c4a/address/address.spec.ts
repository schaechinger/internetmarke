import { expect } from 'chai';

import {
  CompanyAddress,
  parseAddress,
  PersonAddress,
  SimpleAddress,
  SimpleName
} from '../../../src/1c4a/address';
import CountryCode from '../../../src/1c4a/countryCode';
import { AddressError } from '../../../src/1c4a/Error';

describe('Address', () => {
  const address: SimpleAddress = {
    street: 'Landsberger Straße',
    houseNo: '31-35',
    zip: '80339',
    city: 'München'
  };

  it('should parse a person address', () => {
    const namedAddress: SimpleAddress = {
      ...address,
      title: 'Dr.',
      salutation: 'Herrn',
      firstname: 'Martin',
      lastname: 'Leibhard',
      additional: 'Leitung'
    };

    const personAddress = parseAddress(namedAddress) as PersonAddress;

    expect(personAddress).to.exist;
    expect(personAddress.address).to.exist;
    expect(personAddress.address.additional).to.equal(namedAddress.additional);
    expect(personAddress.address.street).to.equal(namedAddress.street);
    expect(personAddress.address.houseNo).to.equal(namedAddress.houseNo);
    expect(personAddress.address.zip).to.equal(namedAddress.zip);
    expect(personAddress.address.city).to.equal(namedAddress.city);
    expect(personAddress.address.country).to.equal(CountryCode.DEU);

    expect(personAddress.name).to.exist;
    expect(personAddress.name.personName).to.exist;
    expect(personAddress.name.personName.firstname).to.equal(namedAddress.firstname);
    expect(personAddress.name.personName.lastname).to.equal(namedAddress.lastname);
    expect(personAddress.name.personName.title).to.equal(namedAddress.title);
    expect(personAddress.name.personName.salutation).to.equal(namedAddress.salutation);
  });

  it('should parse a company address', () => {
    const compAddress = {
      ...address,
      company: 'Augustiner-Bräu Wagner KG'
    };
    const companyAddress = parseAddress(compAddress) as CompanyAddress;

    expect(companyAddress).to.exist;
    expect(companyAddress.address).to.exist;

    expect(companyAddress.name).to.exist;
    expect((companyAddress as any).name.personName).to.not.exist;
    expect(companyAddress.name.companyName).to.exist;
    expect(companyAddress.name.companyName.personName).to.not.exist;
    expect(companyAddress.name.companyName.company).to.equal(compAddress.company);
  });

  it('should parse a named company address', () => {
    const compAddress: SimpleAddress = {
      ...address,
      company: 'Augustiner-Bräu Wagner KG',
      firstname: 'Martin',
      lastname: 'Leibhard'
    };

    const companyAddress = parseAddress(compAddress) as CompanyAddress;

    expect(companyAddress).to.exist;

    expect(companyAddress.name).to.exist;
    expect(companyAddress.name.companyName).to.exist;
    expect(companyAddress.name.companyName.personName).to.exist;
  });

  it('should parse an address with state info', () => {
    const compAddress: SimpleAddress = {
      ...address,
      state: 'by',
      company: 'Augustiner-Bräu Wagner KG'
    };

    const companyAddress = parseAddress(compAddress) as CompanyAddress;

    expect(companyAddress.address.zip).to.equal(`BY ${compAddress.zip}`);
  });

  it('should throw an error for missing address data', () => {
    const name: SimpleName = {
      firstname: 'Martin',
      lastname: 'Leibhard'
    };

    const parts = Object.keys(address);
    for (let i = 0; parts.length > i; i += 1) {
      const invalidAddress: any = { ...name };

      parts.forEach((part, index) => {
        if (index !== i) {
          invalidAddress[part] = address[part];
        }
      });

      expect(() => parseAddress(invalidAddress)).to.throw(AddressError);
    }
  });

  it('should throw an error for missing company or name data', () => {
    expect(() => parseAddress(address)).to.throw(AddressError);
  });

  describe('CountryCode', () => {
    it('should accept valid country codes', () => {
      const foreignAddress: SimpleAddress = {
        company: 'Other Half Brewing Co.',
        street: 'Centre St.',
        houseNo: '191',
        zip: '11231',
        city: 'Brooklyn',
        country: CountryCode.USA
      };

      const result = parseAddress(foreignAddress);

      expect(result).to.exist;
      expect(result.address.country).to.equal(CountryCode.USA);
    });

    it('should accept valid lower case country codes', () => {
      const foreignAddress: SimpleAddress = {
        company: 'Goose Island Beer Co.',
        street: 'West Fulton St.',
        houseNo: '1800',
        zip: '60612',
        city: 'Chicago',
        country: 'usa' as CountryCode
      };

      const result = parseAddress(foreignAddress);

      expect(result).to.exist;
      expect(result.address.country).to.equal(CountryCode.USA);
    });

    it('should throw an error for invalid country codes', () => {
      const invalidAddress: SimpleAddress = {
        ...address,
        country: 'XXX' as CountryCode
      };

      expect(() => parseAddress(invalidAddress)).to.throw(AddressError);
    });
  });
});
