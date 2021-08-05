import { expect } from 'chai';
import { Client, ClientCredentials } from '../../src/prodWs/Client';

describe('Client', () => {
  let client: Client;
  const credentials: ClientCredentials = {
    username: 'username',
    id: 'clientid',
    password: 'password'
  };

  beforeEach(() => {
    client = new Client(credentials);
  });

  it('should return credentials', () => {
    expect(client.getId()).to.equal(credentials.id);
    expect(client.getUsername()).to.equal(credentials.username);
    expect(client.getPassword()).to.equal(credentials.password);
  });

  it('should generate the client id if non is provided', () => {
    const cred = { ...credentials };
    delete cred.id;
    client = new Client(cred);

    expect(client.getId()).to.equal(cred.username.toUpperCase());
  });
});
