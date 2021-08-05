import { expect } from 'chai';
import { getLogger } from '../../src/utils/logger';

describe('Logger', () => {
  it('should create a logger in default namespace', () => {
    const log = getLogger();

    expect(log.namespace).to.equal('internetmarke');
  });

  it('should create a logger with a given sub namespace', () => {
    const log = getLogger('test');

    expect(log.namespace).to.equal('internetmarke:test');
  });
});
