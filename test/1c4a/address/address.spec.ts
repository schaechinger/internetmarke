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
  it('should parse a person address', () => {
    const address: SimpleAddress = {
      title: 'Dr.',
      salutation: 'Herrn',
      firstname: 'Max',
      lastname: 'Mustermann',
      additional: 'Stadtverwaltung',
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'Munich'
    };

    const personAddress = parseAddress(address) as PersonAddress;

    expect(personAddress).to.exist;
    expect(personAddress.address).to.exist;
    expect(personAddress.address.additional).to.equal(address.additional);
    expect(personAddress.address.street).to.equal(address.street);
    expect(personAddress.address.houseNo).to.equal(address.houseNo);
    expect(personAddress.address.zip).to.equal(address.zip);
    expect(personAddress.address.city).to.equal(address.city);
    expect(personAddress.address.country).to.equal(CountryCode.DEU);

    expect(personAddress.name).to.exist;
    expect(personAddress.name.personName).to.exist;
    expect(personAddress.name.personName.firstname).to.equal(address.firstname);
    expect(personAddress.name.personName.lastname).to.equal(address.lastname);
    expect(personAddress.name.personName.title).to.equal(address.title);
    expect(personAddress.name.personName.salutation).to.equal(address.salutation);
  });

  it('should parse a company address', () => {
    const address: SimpleAddress = {
      company: 'Landeshauptstadt München',
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'Munich'
    };

    const companyAddress = parseAddress(address) as CompanyAddress;

    expect(companyAddress).to.exist;
    expect(companyAddress.address).to.exist;

    expect(companyAddress.name).to.exist;
    expect((companyAddress as any).name.personName).to.not.exist;
    expect(companyAddress.name.companyName).to.exist;
    expect(companyAddress.name.companyName.personName).to.not.exist;
    expect(companyAddress.name.companyName.company).to.equal(address.company);
  });

  it('should parse a named company address', () => {
    const address: SimpleAddress = {
      company: 'Landeshauptstadt München',
      firstname: 'Max',
      lastname: 'Mustermann',
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'Munich'
    };

    const companyAddress = parseAddress(address) as CompanyAddress;

    expect(companyAddress).to.exist;

    expect(companyAddress.name).to.exist;
    expect(companyAddress.name.companyName).to.exist;
    expect(companyAddress.name.companyName.personName).to.exist;
  });

  it('should throw an error for missing address data', () => {
    const addressParts: any = {
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'Munich'
    };
    const name: SimpleName = {
      firstname: 'Max',
      lastname: 'Mustermann'
    };

    const parts = Object.keys(addressParts);
    for (let i = 0; parts.length > i; i++) {
      const invalidAddress: any = { ...name };

      parts.forEach((part, index) => {
        if (index !== i) {
          invalidAddress[part] = addressParts[part];
        }
      });

      expect(() => parseAddress(invalidAddress)).to.throw(AddressError);
    }
  });

  it('should throw an error for company or name data', () => {
    const address: SimpleAddress = {
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'Munich'
    };

    expect(() => parseAddress(address)).to.throw(AddressError);
  });

  describe('CountryCode', () => {
    it('should accept valid country codes', () => {
      const foreignAddress: SimpleAddress = {
        firstname: 'John',
        lastname: 'Doe',
        street: 'Morningside Road',
        houseNo: '44',
        zip: 'EH10 4BF',
        city: 'Edinburgh',
        country: CountryCode.GBR
      };

      const address = parseAddress(foreignAddress);

      expect(address).to.exist;
      expect(address.address.country).to.equal(CountryCode.GBR);
    });

    it('should accept valid lower case country codes', () => {
      const foreignAddress: SimpleAddress = {
        firstname: 'John',
        lastname: 'Doe',
        street: 'Morningside Road',
        houseNo: '44',
        zip: 'EH10 4BF',
        city: 'Edinburgh',
        country: 'gbr' as CountryCode
      };

      const address = parseAddress(foreignAddress);

      expect(address).to.exist;
      expect(address.address.country).to.equal(CountryCode.GBR);
    });

    it('should throw an error for invalid country codes', () => {
      const address: SimpleAddress = {
        street: 'Marienplatz',
        houseNo: '8',
        zip: '80331',
        city: 'Munich',
        country: 'XXX' as CountryCode
      };

      expect(() => parseAddress(address)).to.throw(AddressError);
    });
  });
});
