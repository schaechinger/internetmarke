import { expect } from 'chai';
import { parseName, PersonName, SimpleName } from '../../../src/1c4a/address';

describe('PersonName', () => {
  it('should parse a person name', () => {
    const name: SimpleName = {
      title: 'Dr.',
      salutation: 'Herrn',
      firstname: 'Max',
      lastname: 'Mustermann'
    };

    const personName = parseName(name) as PersonName;

    expect(personName).to.exist;
    expect(personName.firstname).to.equal(name.firstname);
    expect(personName.lastname).to.equal(name.lastname);
    expect(personName.title).to.equal(name.title);
    expect(personName.salutation).to.equal(name.salutation);
  });

  it('should parse a person name without title', () => {
    const name: SimpleName = {
      salutation: 'Herrn',
      firstname: 'Max',
      lastname: 'Mustermann'
    };

    const personName = parseName(name) as PersonName;

    expect(personName).to.exist;
    expect(personName.firstname).to.equal(name.firstname);
    expect(personName.lastname).to.equal(name.lastname);
    expect(personName.salutation).to.equal(name.salutation);
    expect(personName.title).to.not.equal;
  });

  it('should parse a person name without salutation', () => {
    const name: SimpleName = {
      firstname: 'Max',
      lastname: 'Mustermann'
    };

    const personName = parseName(name) as PersonName;

    expect(personName).to.exist;
    expect(personName.firstname).to.equal(name.firstname);
    expect(personName.lastname).to.equal(name.lastname);
    expect(personName.salutation).to.not.equal;
  });

  it('should parse empty person name as null', () => {
    const name: SimpleName = {};

    const personName = parseName(name);

    expect(personName).to.not.exist;
  });
});
