const Internetmarke = require('../');

describe('Internetmarke', () => {
  it('should connect to service', (done) => {
    const post = new Internetmarke();

    post.authenticate({
      username: 'test@dpag.de',
      password: '#MyPassword'
    })
      .then(result => {
        done();
      });
  }).timeout(10000);
});
