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

  updateGallery(soapClient, type = GALLERY_TYPES.PUBLIC) {
    const method = `retrieve${type}GalleryAsync`;

    return soapClient.then(client => {
      client[method]()
        .then(response => {

          console.log(DATA_DIR);
          fs.writeFile(DATA_DIR + '/gallery.json', JSON.stringify(response.items), (err) => console.log);

          return true;
        });
    });
  }

  // TODO: use mongo
  _loadGallery() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR);
    }

    // TODO: load gallery
  }
}

Gallery.GALLERY_TYPES = GALLERY_TYPES;

module.exports = Gallery;
