import { InternetmarkeError } from "../Error";

export class ProductError extends InternetmarkeError {}

export class ClientError extends ProductError {}
