import { expect } from 'chai';

import { formatDate } from '../../../src/prodWs/date';

describe('Date', () => {
  it('should format the current date if no date is provided', () => {
    const dateObj = formatDate();

    expect(dateObj).to.exist;
    expect(dateObj.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateObj.time).to.match(/^\d{2}:\d{2}:\d{2}\.\d{3}\+00:00$/);
  });

  it('should handle a given date', () => {
    const date = new Date('2021-07-28 14:33:00.000+02:00');
    const dateObj = formatDate(date);

    expect(dateObj).to.exist;
    expect(dateObj.date).to.equal('2021-07-28');
    expect(dateObj.time).to.equal('12:33:00.000+00:00');
  });
});
