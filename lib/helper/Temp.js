/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Lisenced
 */

'use strict';

const fs = require('fs'),
  os = require('os'),
  path = require('path');

const BASE_DIR = 'node-internetmarke';

class Temp {
  /**
   * Creates a new temp instance to manage temporary files.
   *
   * @constructor
   * @param {Object} config
   * @param {string} [config.file] - The filename of the temp file if only a
   *   single file should be handled.
   * @param {string} [config.dir] - A directory inside the temp dir that
   *   should be used to handle multiple files.
   */
  constructor({ file = null, dir = null } = {}) {
    /** @type {string} */
    this._tmpDir = null;
    /** @type {(string|null)} */
    this._file = null;

    this._init(dir);

    if (file) {
      this._file = path.join(this._tmpDir, file);

      fs.closeSync(fs.openSync(this._file, 'a'));
    }
  }

  /**
   * Retrieve the content of the temp file or the given file.
   * 
   * @param {(string|null)} [file] - The filename if it was not given in the
   *   constructor.
   * @returns {Promise.<(string|boolean)>}
   */
  get(file = null) {
    if (!file && !this._file) {
      return Promise.resolve(false);
    }

    file = this._getFilePath(file);

    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, content) => {
        if (err) {
          reject(err);
        }

        resolve(content);
      });
    });
  }

  /**
   * Stores the given content to the temp file or the given file.
   * 
   * @param {string} content - The content that should be stored in the file.
   * @param {(string|null)} file - The file name if not given in the constructor.
   * @returns {Promise.<boolean>}
   */
  update(content, file = null) {
    if (!file && !this._file) {
      return Promise.resolve(false);
    }

    file = this._getFilePath(file);

    return new Promise(resolve => {
      fs.writeFile(file, content, err => {
        resolve(!err);
      });
    });
  }

  /**
   * Remove the given file from the temp dir. This is not possible in single
   * file mode!
   * 
   * @param {string} file - The file that should be removed.
   */
  remove(file) {
    if (!file) {
      return Promise.resolve(false);
    }

    file = this._getFilePath(file);

    return new Promise(resolve => {
      fs.unlink(file, err => resolve(!err));
    });
  }

  getDir() {
    if (this._file) {
      return Promise.resolve(false);
    }
  }

  removeDir() {
    if (this._file) {
      return Promise.resolve(false);
    }
  }

  /**
   * Combines the file name or the temp file the the base dir.
   * 
   * @param {(string|null)} file - The file name if given.
   */
  _getFilePath(file) {
    if (file) {
      file = path.join(this._tmpDir, file);
    }
    else {
      file = this._file;
    }

    return file;
  }

  /**
   * Creates the temp dir if necessary and opens the stream to the file.
   * 
   * @param {(string|null)} baseDir - The base dir within the temp dir if given
   *   in the constructor.
   */
  _init(baseDir) {
    this._tmpDir = path.join(os.tmpdir(), BASE_DIR);

    this._checkDir(this._tmpDir);

    if (baseDir) {
      this._tmpDir = path.join(this._tmpDir, baseDir);
      this._checkDir(this._tmpDir);
    }
  }

  /**
   * Checks if the given dir exists and creates it if necessary.
   * 
   * @param {string} dir - The directory that should be checked.
   */
  _checkDir(dir) {
    try {
      fs.accessSync(dir);
    }
    catch(err) {
      fs.mkdirSync(dir);
    }
  }
}

module.exports = Temp;
