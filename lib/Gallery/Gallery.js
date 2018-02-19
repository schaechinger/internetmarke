const fs = require('fs')
  path = require('path');

const GALLERY_TYPES = {
  PUBLIC: 'Public',
  PRIVATE: 'Private'
},
  DATA_DIR = path.resolve(__dirname, '../../data');

class Gallery {
  constructor() {
    this._categories = {};
    this._items = {};

    this._loadGallery();
  }

  /**
   * Concrete update method for the specified gallery.
   * 
   * @param {Object} soapClient - The soap client from the api.
   * @param {string} [type] - The type of the gallery (PUBLIC or PRIVATE).
   * @returns {Promise.boolean}
   */
  updateGallery(soapClient, type = GALLERY_TYPES.PUBLIC) {
    const method = `retrieve${type}GalleryAsync`;

    return soapClient.then(client => {
      client[method]()
        .then(response => {
          fs.writeFile(`${DATA_DIR}/gallery-${type}.json`,
            JSON.stringify(response.items), (err) => {});

          return true;
        })
        .catch(reason => {
          return false;
        });
    });
  }

  /**
   * Update both public and private galleries.
   * 
   * @param {Object} soapClient - The soap client of the api.
   */
  updateGalleries(soapClient) {
    const promises = [];

    GALLERY_TYPES.forEach(type => {
      promises.push(this.updateGallery(soapClient, type));
    });

    return Promise.all(promises);
  }

  // TODO: use mongo
  _loadGallery() {
    // TODO: load gallery
  }
}

Gallery.GALLERY_TYPES = GALLERY_TYPES;

module.exports = Gallery;
