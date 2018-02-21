/**
 * internetmarke
 * Copyright (c) 2018 Manuel Schächinger
 * MIT Licensed
 */

'use strict';

class GalleryItem {
  constructor({ id, name, description}) {
    this._id = id;
    this._name = name;
    this._description = description;
  }
}

module.exports = GalleryItem;
