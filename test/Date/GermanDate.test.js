const GermanDate = require('../../lib/Date/GermanDate');

const germanDate = new GermanDate();

describe('German Date', () => {
  it('should format the current date', () => {
    germanDate.format().should.match(/^\d{8}-\d{6}$/);
  });

  it('should format given dates right', () => {
    [
      {
        input: new Date('2018-01-02T02:04:05+00:00'),
        output: '02012018-030405'
      },
      {
        input: new Date('1991-02-14T22:01:02+00:00'),
        output: '14021991-230102'
      }
    ].forEach(({ input, output }) => {
      germanDate.format(input).should.equal(output);
    });
  });

  it('should format a fake date', () => {
    var clock = sinon.useFakeTimers(1514764800000);
    germanDate.format().should.equal('01012018-010000');
    clock.restore();
  });
});
