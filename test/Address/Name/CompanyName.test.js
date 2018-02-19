const CompanyName = require('../../../lib/Address/Name/CompanyName');

const TEST_DATA = require('./CompanyName.data.json');

describe('Company Name', () => {
  it('should accept valid companies', () => {
    TEST_DATA.valid.forEach(data => {
      const company = new CompanyName(data);

      company.isValid().should.be.true();
      const name = company.getName();
      name.should.have.property('companyName');
      name.companyName.should.containEql(data);
      name.companyName.should.not.have.property('personName');
    });
  });

  it('should accept valid companies with person name', () => {
    TEST_DATA.validWithPerson.forEach(data => {
      const company = new CompanyName(data);

      company.isValid().should.be.true();
      const name = company.getName();
      name.should.have.property('companyName');
      name.companyName.should.have.property('company').and.equal(data.company);
      
      name.companyName.should.have.property('personName');
      delete data.company;
      name.companyName.personName.should.containEql(data);
    });
  });

  it('should detect invalid companies', () => {
    TEST_DATA.invalid.forEach(data => {
      const company = new CompanyName(data);

      company.isValid().should.be.false();
      company.getName().should.be.false();
    });
  });

  it('should detect companies with invalid person names', () => {
    TEST_DATA.invalidInPerson.forEach(data => {
      const company = new CompanyName(data);

      company.isValid().should.be.true();
      const name = company.getName();
      name.should.have.property('companyName');
      name.companyName.should.have.property('company').and.equal(data.company);
      name.companyName.should.not.have.property('personName');
    });
  });
});
