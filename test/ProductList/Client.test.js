const Client = require('../../lib/ProductList/Client'),
  errors = require('../../lib/errors');

describe('Client', () => {
  const args = {
    username: 'myusername',
    password: '#MY_PASS',
    id: 'myid'
  };

  it('should require client credentials', () => {
    (() => {
      const client = new Client();
    }).should.throw(errors.usage.missingClientCredentials);
  });

  it('should create instance with demo data', () => {
    const client = new Client(args);

    client.should.be.ok();

    client.getUsername().should.equal(args.username);
    client.getPassword().should.equal(args.password);
    client.getId().should.equal(args.id);
  });
  
  it('should generate the client id if not given', () => {
    const credentials = {
      username: 'myusername',
      password: '*****'
    };

    const client = new Client(credentials);

    client.getId().should.equal(credentials.username.toUpperCase());
  });
});
