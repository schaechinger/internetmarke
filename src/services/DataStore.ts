import { Debugger } from 'debug';
import fs from 'fs';
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import { getLogger } from '../utils/logger';
// @ts-ignore
import { version as packageVersion } from '../../package.json';

const BASE_DIR = 'node-internetmarke';

interface CacheFormat<T> {
  date: string;
  version: string;
  content: { [id: number]: T };
}

/**
 * Creates a new temp instance to manage temporary files.
 */
export class DataStore<T> {
  private file: string;
  private name: string;
  private ttl = 7 * 24 * 3600;
  private data: { [id: number]: T };
  private lastUpdate: Date | null = null;
  private log: Debugger;
  private loadData: () => Promise<{ [id: number]: T }>;

  constructor() {
    this.log = getLogger('dataStore');
  }

  /**
   * Creates the temp file if necessary and loads the latest data if available.
   */
  public async init(
    file: string,
    loadData: () => Promise<{ [id: number]: T }>,
    ttl?: number
  ): Promise<void> {
    this.name = file.substr(0, file.lastIndexOf('.'));
    this.loadData = loadData;
    if (ttl) {
      this.ttl = ttl;
    }

    const dir = joinPath(tmpdir(), BASE_DIR);
    try {
      fs.accessSync(dir);
    } catch (err) {
      fs.mkdirSync(dir);
    }
    this.file = joinPath(dir, file);
    fs.closeSync(fs.openSync(this.file, 'a'));

    await this.load();
    await this.checkData();
  }

  /**
   * Retrieve the content of the temp file or the given file.
   */
  public async getList(): Promise<T[]> {
    await this.checkData();

    return Object.values(this.data);
  }

  /**
   * Retrieves one item with the given id if existing.
   *
   * @param id The id of the item.
   */
  public async getItem(id: number): Promise<T | null> {
    await this.checkData();

    return this.data[id] || null;
  }

  /**
   * Stores the given content to the temp file or the given file.
   *
   * @param content - The content that should be stored in the file.
   */
  public update(content: { [id: number]: T }, date = new Date()): Promise<boolean> {
    this.data = content;
    this.lastUpdate = date;

    const data: CacheFormat<T> = {
      date: this.lastUpdate.toISOString(),
      version: packageVersion,
      content: this.data
    };

    return new Promise(resolve => {
      fs.writeFile(this.file, JSON.stringify(data), err => {
        resolve(!err);
      });
    });
  }

  /**
   * Removes the given file from the temp dir.
   */
  public remove(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      fs.unlink(this.file, err => resolve(!err));
    }).then(success => {
      this.data = {};
      this.lastUpdate = null;

      return success;
    });
  }

  /**
   * Validates the data from the cache depending on the last update time.
   */
  public isValid(): boolean {
    if (!this.lastUpdate || this.ttl * 1000 < Date.now() - this.lastUpdate.getTime()) {
      this.log(`store %s is outdated`, this.name);

      return false;
    }

    return true;
  }

  private async checkData(): Promise<void> {
    if (!this.isValid()) {
      const content = await this.loadData();

      await this.update(content);
    }
  }

  private load(): Promise<void> {
    return new Promise(resolve => {
      fs.readFile(this.file, (err, content) => {
        if (!err && content && content.length) {
          const data: CacheFormat<T> = JSON.parse(content.toString());

          if (data.version === packageVersion) {
            this.lastUpdate = new Date(data.date);
            this.data = data.content;
          }
        }

        resolve();
      });
    });
  }
}
