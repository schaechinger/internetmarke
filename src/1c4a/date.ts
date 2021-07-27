import moment from 'moment-timezone';

const TIMEZONE = 'Europe/Berlin';

export const formatDate = (date?: Date, timezone = TIMEZONE): string => {
  date = date || new Date();

  return moment(date).tz(timezone).format('DDMMYYYY-HHmmss');
};
