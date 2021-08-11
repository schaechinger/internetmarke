import { expect } from 'chai';
import { parseJournalEntry } from '../../../src/portokasse/journal';

export const journalResult = {
  startDate: '01.08.2021',
  endDate: '11.08.2021',
  oldBalance: 0,
  newBalance: 1000,
  journalEntries: [
    {
      state: 'PREPARED',
      date: 1628631188000,
      amount: 1000,
      accountingText: 'Giropay (HOLVDEB1XXX)',
      type: 'TRANSFER',
      channel: 'Deutsche Post - Portokasse',
      shopOrderId: '123456789'
    }
  ]
};

describe('Journal', () => {
  it('should detect invalid journal entries', () => {
    [null, undefined, '', 'test', {}, { id: 1 }].forEach(invalidEntry => {
      expect(parseJournalEntry(invalidEntry)).to.be.null;
    });
  });

  it('should parse journal entry', () => {
    const data = journalResult.journalEntries[0];

    const entry = parseJournalEntry(data);

    expect(entry).to.exist;
    expect(entry!.date.getTime()).to.equal(data.date);
    expect(entry!.amount.value).to.equal(data.amount / 100);
    expect(entry!.state).to.equal(data.state);
    expect(entry!.accountText).to.equal(data.accountingText);
    expect(entry!.type).to.equal(data.type);
    expect(entry!.channel).to.equal(data.channel);
    expect(entry!.shopOrderId).to.equal(+data.shopOrderId);
  });
});
