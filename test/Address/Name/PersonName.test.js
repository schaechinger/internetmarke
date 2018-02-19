const PersonName = require('../../../lib/Address/Name/PersonName');

const TEST_DATA = require('./PersonName.data.json');

describe('Person Name', () => {
  it('should accept valid names', () => {
    TEST_DATA.valid.forEach(data => {
      const person = new PersonName(data);

      person.isValid().should.be.true();
      const name = person.getName();
      name.should.have.property('personName');
      name.personName.should.containEql(data);
    });
  });

  it('should detect invalid names', () => {
    TEST_DATA.invalid.forEach(data => {
      const person = new PersonName(data);

      person.isValid().should.be.false();
      person.getName().should.be.false();
    });
  });

});
