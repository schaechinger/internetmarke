export interface Amount {
  value: number;
  currency: string;
}

export const amountToCents = (amount?: Amount | number): number => {
  if (!amount) {
    return 0;
  }

  if ('object' !== typeof amount) {
    return +amount;
  }

  return amount.value * 100;
};

export const parseAmount = (cents: Amount | number): Amount => {
  if ('object' !== typeof cents) {
    return {
      value: +cents / 100,
      currency: 'EUR'
    };
  }

  return cents;
};
