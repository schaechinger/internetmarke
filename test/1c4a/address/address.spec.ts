import { expect } from 'chai';
import {
  CompanyAddress,
  CountryCode,
  parseAddress,
  PersonAddress,
  SimpleAddress
} from '../../../src/1c4a/address';

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
});
