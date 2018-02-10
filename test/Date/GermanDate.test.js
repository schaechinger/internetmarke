const GermanDate = require('../../lib/Date/GermanDate');

const germanDate = new GermanDate();

describe('German Date', () => {
  it('should format the current date', () => {
    germanDate.format().should.match(/^\d{8}-\d{6}$/);
  });

  it('should format given dates right', () => {
    [
      {
        input: new Date('2018-01-02 03:04:05'),
        output: '02012018-030405'
      },
      {
        input: new Date('1991-02-14 23:01:02'),
        output: '14021991-230102'
      }
    ].forEach(({ input, output }) => {
      germanDate.format(input).should.equal(output);
    });
  });
});
