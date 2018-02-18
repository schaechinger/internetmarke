const PersonName = require('../../../lib/Address/Name/PersonName');

const TEST_DATA = require('./PersonName.data.json');

describe('PersonName', () => {
  it('should accept valid names', () => {
    TEST_DATA.valid.forEach(data => {
      const person = new PersonName(data);

      person.isValid().should.be.true();
    });
  });

  it('should detect invalidat names', () => {
    TEST_DATA.invalid.forEach(data => {
      const person = new PersonName(data);

      person.isValid().should.be.false();
    });
  });
});
