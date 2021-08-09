export class InternetmarkeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class SoapError extends InternetmarkeError {}
export class UserError extends InternetmarkeError {}
