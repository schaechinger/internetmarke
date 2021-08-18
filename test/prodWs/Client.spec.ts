import { expect } from 'chai';

import { Client } from '../../src/prodWs/Client';
import { clientCredentials } from './helper';

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client();
    client.setCredentials(clientCredentials);
  });

  it('should return credentials', () => {
    expect(client.getId()).to.equal(clientCredentials.id);
    expect(client.getUsername()).to.equal(clientCredentials.username);
    expect(client.getPassword()).to.equal(clientCredentials.password);
  });

  it('should generate the client id if non is provided', () => {
    const cred = { ...clientCredentials };
    delete cred.id;
    client.setCredentials(cred);

    expect(client.getId()).to.equal(cred.username.toUpperCase());
  });
});
