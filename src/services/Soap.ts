import { Debugger } from 'debug';
import { inject, injectable } from 'inversify';
import { Client as SoapClient } from 'soap';
import { TYPES } from '../di/types';
import { InternetmarkeError } from '../Error';
import { PostService } from './service';

/**
 * Parent class of each soap service that provides basic connection functions.
 */
@injectable()
export abstract class SoapService implements PostService {
  /** The wsdl url to define the service endpoints. */
  protected abstract wsdl: string;

  /** The soap client used to request the service. */
  protected soapClient: SoapClient;

  protected log: Debugger;

  constructor(
    @inject(TYPES.SoapClientFactory) private getSoapClient: (wsdl: string) => Promise<SoapClient>
  ) {}

  public isInitialized(): boolean {
    return !!this.soapClient;
  }

  /** Initializes the soap client to work with the service. */
  protected abstract initSoapClient(): void;

  /**
   * Helper method to retrieve the soap client for every api call.
   */
  protected async checkSoapClient(): Promise<void> {
    if (!this.soapClient) {
      this.soapClient = await this.getSoapClient(this.wsdl);

      this.initSoapClient();
    }
  }

  protected async checkServiceInit(message: string): Promise<void> {
    if (!this.isInitialized()) {
      throw new InternetmarkeError(message);
    }
  }
}
