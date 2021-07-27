import md5 from "md5";
import { formatDate } from "./date";

export interface PartnerCredentials {
  id: string;
  secret: string;
  keyPhase?: number;
}

const CREDENTIALS = Symbol("credentials");

export interface PartnerSoapHeader {
  PARTNER_ID: string;
  REQUEST_TIMESTAMP: string;
  KEY_PHASE: number;
  PARTNER_SIGNATURE: string;
}

const SIGNATURE_SEPARATOR = "::";
const SIGNATURE_EMPTY = "::::";

export class Partner {
  private [CREDENTIALS]: PartnerCredentials;

  constructor(credentials: PartnerCredentials) {
    this[CREDENTIALS] = credentials;
  }

  /**
   * Retrieve the headers to authenticate the partner in the soap requests.
   */
  public getSoapHeaders(): PartnerSoapHeader {
    return {
      PARTNER_ID: this[CREDENTIALS].id,
      REQUEST_TIMESTAMP: formatDate(),
      KEY_PHASE: this[CREDENTIALS].keyPhase || 1,
      PARTNER_SIGNATURE: this.generateSignature(),
    };
  }

  /**
   * Generates a signature with the user credentials to validate the request.
   *
   * @param date The date of the signature, defaults to now.
   */
  private generateSignature(date?: Date): string {
    const signature = [
      this[CREDENTIALS].id || SIGNATURE_EMPTY,
      formatDate(date) || SIGNATURE_EMPTY,
      this[CREDENTIALS].keyPhase || SIGNATURE_EMPTY,
      this[CREDENTIALS].secret || SIGNATURE_EMPTY,
    ].join(SIGNATURE_SEPARATOR);

    return md5(signature).substr(0, 8);
  }
}