import { expect } from 'chai';

import { formatDate } from '../../../src/portokasse/date';

describe('Date', () => {
  it('should format the current date if no date is provided', () => {
    const dateString = formatDate();

    expect(dateString).to.exist;
    expect(dateString).to.match(/^\d{2}.\d{2}.\d{4}$/);
  });

  it('should handle a given date', () => {
    const date = new Date('2021-07-28 14:33:00.000+02:00');
    const dateString = formatDate(date);

    expect(dateString).to.exist;
    expect(dateString).to.equal('28.07.2021');
  });

  it('should handle a given date in a different time zone', () => {
    const date = new Date('2021-07-25 04:33:00.000+07:00');
    const dateString = formatDate(date);

    expect(dateString).to.exist;
    expect(dateString).to.equal('24.07.2021');
  });
});
