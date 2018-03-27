const GermanDate = require('../../lib/Date/GermanDate');

const TEST_DATA = require('./GermanDate.data.json');

let germanDate;

describe('German Date', () => {
  beforeEach(() => {
    germanDate = new GermanDate();
  });

  it('should format the current date', () => {
    germanDate.format().should.match(/^\d{8}-\d{6}$/);
  });

  it('should format given dates right', () => {
    TEST_DATA.valid.forEach(({ input, output }) => {
      germanDate.format(new Date(input)).should.equal(output);
    });
  });

  it('should format a fake date', () => {
    const clock = sinon.useFakeTimers(1514764800000);
    germanDate.format().should.equal('01012018-010000');
    clock.restore();
  });
});
