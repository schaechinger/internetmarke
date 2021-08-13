import moment from 'moment-timezone';

const TIMEZONE = 'Europe/Berlin';

export const formatDate = (date?: Date, timezone = TIMEZONE): string => {
  const dateObj = date || new Date();

  return moment(dateObj).tz(timezone).format('DD.MM.YYYY');
};
