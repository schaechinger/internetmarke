import { expect } from 'chai';
import { formatDate } from '../../../src/1c4a/date';

describe('Date', () => {
  it('should format the current date if no date is provided', () => {
    const dateString = formatDate();

    expect(dateString).to.exist;
    expect(dateString).to.match(/^\d{8}-\d{6}$/);
  });

  it('should handle a given date', () => {
    const date = new Date('2021-07-28 14:33:00.000+02:00');
    const dateString = formatDate(date);

    expect(dateString).to.exist;
    expect(dateString).to.equal('28072021-143300');
  });

  it('should handle a given date in a different time zone', () => {
    const date = new Date('2021-07-28 19:33:00.000+07:00');
    const dateString = formatDate(date);

    expect(dateString).to.exist;
    expect(dateString).to.equal('28072021-143300');
  });
});
