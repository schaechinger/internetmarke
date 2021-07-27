import { Client as SoapClient, createClientAsync } from 'soap';

/**
 * Parent class of each soap service that provides basic connection functions.
 */
export abstract class SoapService {
  /** The wsdl url to define the service endpoints. */
  protected abstract wsdl: string;
  /** The soap client used to request the service. */
  protected soapClient: SoapClient;

  /** Initializes the soap client to work with the service. */
  protected abstract initSoapClient(): void;

  /**
   * Helper method to retrieve the soap client for every api call.
   */
  protected async checkSoapClient(): Promise<void> {
    if (!this.soapClient) {
      this.soapClient = await createClientAsync(this.wsdl, {
        disableCache: true
      });

      this.initSoapClient();
    }
  }
}
