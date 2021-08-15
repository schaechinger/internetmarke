/* eslint-disable max-classes-per-file */
import { InternetmarkeError } from '../Error';

export class ProductError extends InternetmarkeError {}

export class ClientError extends ProductError {}
