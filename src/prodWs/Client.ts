import { injectable } from 'inversify';

export interface ClientCredentials {
  username: string;
  password: string;
  id?: string;
}

const CREDENTIALS = Symbol('credentials');

@injectable()
export class Client {
  private [CREDENTIALS]: ClientCredentials;

  /**
   * Set the credentials to use the services.
   *
   * @param credentials The credentials that authenticate the client.
   */
  setCredentials(credentials: ClientCredentials): void {
    this[CREDENTIALS] = credentials;
  }

  public getUsername(): string {
    return this[CREDENTIALS].username;
  }

  public getPassword(): string {
    return this[CREDENTIALS].password;
  }

  public getId(): string {
    return this[CREDENTIALS].id || this[CREDENTIALS].username.toUpperCase();
  }
}
