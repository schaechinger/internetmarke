import { expect } from 'chai';
import { accessSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { sync as rmdirSync } from 'rimraf';
import { stub } from 'sinon';
import { DataStore } from '../../src/services/DataStore';
import { getLoggerStub } from '../stubs/logger.stub';

describe('DataStore', () => {
  let store: DataStore<any>;
  const tmpFile = 'test.json';
  const rootPath = joinPath(tmpdir(), 'node-internetmarke');
  const tmpPath = joinPath(rootPath, tmpFile);

  let loadData: any;

  beforeEach(() => {
    store = new DataStore(getLoggerStub);

    loadData = stub().returns(
      Promise.resolve({
        1: 'test1',
        2: 'test2',
        3: 'test3'
      })
    );
  });

  afterEach(() => {
    try {
      unlinkSync(tmpPath);
    } catch {}
  });

  it('should create the root temp dir if not existing', async () => {
    rmdirSync(rootPath, {});

    await store.init(tmpFile, loadData);

    expect(() => accessSync(tmpPath)).to.not.throw();
  });

  it('should load test data', async () => {
    await store.init(tmpFile, loadData);

    expect(() => accessSync(tmpPath)).to.not.throw();
    expect(loadData.calledOnce).to.be.true;
  });

  it('should load test data from cache', async () => {
    await store.init(tmpFile, loadData);

    await store.getList();

    await store.init(tmpFile, loadData);

    expect(() => accessSync(tmpPath)).to.not.throw;
    expect(loadData.calledOnce).to.be.true;
  });

  it('should reload the data after they are expired', async () => {
    await store.init(tmpFile, loadData, 0.01);

    await new Promise<void>(resolve => {
      setTimeout(async () => {
        await store.getList();

        expect(loadData.calledTwice).to.be.true;
        resolve();
      }, 11);
    });
  });

  it('should reload the data with disabled cache', async () => {
    await store.init(tmpFile, loadData, 0);
    await store.getList();

    expect(loadData.calledTwice).to.be.true;
  });

  it('should remove cached data', async () => {
    await store.init(tmpFile, loadData);

    await store.remove();

    expect(() => accessSync(tmpPath)).to.throw();
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
