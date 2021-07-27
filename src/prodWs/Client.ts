export interface ClientCredentials {
  username: string;
  password: string;
  id?: string;
}

const CREDENTIALS = Symbol("credentials");

export class Client {
  private [CREDENTIALS]: ClientCredentials;

  constructor(credentials: ClientCredentials) {
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
