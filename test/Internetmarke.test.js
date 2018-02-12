const config = require('config');

const Internetmarke = require('../');

describe.only('Internetmarke', () => {
  it('should connect to service', (done) => {
    try {
      const config = require('config');
      const im = new Internetmarke(config.get('partner'));
      im.authenticateUser(config.get('user'))
        .then(im => {
          const link = im.getStampPreview({ productCode: 11 });

          link.should.match(/^https:\/\/internetmarke.deutschepost.de\/.*$/);

          done();
        });
    }
    catch (e) {
      console.error('Could not load config.', e.message);
    }
  }).timeout(10000);
});
