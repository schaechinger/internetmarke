import { Client as SoapClient, createClientAsync } from 'soap';

export abstract class SoapService {
  protected abstract wsdl: string;

  protected soapClient: SoapClient;

  /**
   * Initializes the soap client to work with the service.
   */
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
