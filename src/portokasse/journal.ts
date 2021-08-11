import { Amount, parseAmount } from '../utils/amount';

export interface JournalRange {
  startDate: Date;
  endDate: Date;
}

export type JournalOptions = JournalRange | number;

export enum JournalEntryType {
  Payment = 'PAYMENT',
  Transfer = 'TRANSFER'
}

export enum JournalEntryState {
  Prepared = 'PREPARED',
  Executed = 'EXECUTED'
}

export interface Journal {
  journalEntries: JournalEntry[];
  newBalance: Amount;
  oldBalance: Amount;
  startDate: Date;
  endDate: Date;
}

export interface JournalEntry {
  type: JournalEntryType;
  state: JournalEntryState;
  amount: Amount;
  date: Date;
  shopOrderId: number;
  accountText: string;
  channel: string;
}

export const parseJournalEntry = (data: any): JournalEntry | null => {
  if (!data?.shopOrderId) {
    return null;
  }

  return {
    state: data.state,
    date: new Date(data.date),
    amount: parseAmount(data.amount),
    accountText: data.accountingText,
    type: data.type,
    channel: data.channel,
    shopOrderId: +data.shopOrderId
  };
};
