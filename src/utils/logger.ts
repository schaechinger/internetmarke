import { debug, Debugger } from 'debug';

export const getLogger = (logId?: string): Debugger => {
  return debug(`internetmarke${logId ? `:${logId}` : ''}`);
};
