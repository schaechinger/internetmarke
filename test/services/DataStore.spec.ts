import { expect } from 'chai';
import { accessSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { DataStore } from '../../src/services/DataStore';

const loadData = async () => {
  return {
    1: 'test1',
    2: 'test2',
    3: 'test3'
  };
};

describe('DataStore', () => {
  let store: DataStore<any>;
  const tmpFile = 'test.json';
  const tmpPath = joinPath(tmpdir(), 'node-internetmarke', tmpFile);

  beforeEach(() => {
    try {
      unlinkSync(tmpFile);
    } catch {}
    store = new DataStore();
  });

  it('should load test data', async () => {
    await store.init(tmpFile, loadData);

    expect(() => accessSync(tmpPath)).to.not.throw;
    // expect(loadData).to.have.been.called, stub
  });

  it('should store data', async () => {
    await store.init(tmpFile, loadData);

    const list = await store.getList();

    expect(list).to.have.length(3);
  });

  it('should retrieve data item by id', async () => {
    await store.init(tmpFile, loadData);

    const item = await store.getItem(1);

    expect(item).to.equal('test1');
  });

  it('should detect an unknown item id', async () => {
    await store.init(tmpFile, loadData);

    const item = await store.getItem(7);

    expect(item).to.not.exist;
  });
});
