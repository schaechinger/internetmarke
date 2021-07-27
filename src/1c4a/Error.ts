import { InternetmarkeError } from '../Error';

export class OneClickForAppError extends InternetmarkeError {}

export class PartnerError extends OneClickForAppError {}
export class UserError extends OneClickForAppError {}

export class AddressError extends OneClickForAppError {}
export class CheckoutError extends OneClickForAppError {}
export class PageFormatError extends OneClickForAppError {}
export class VoucherFormatError extends OneClickForAppError {}
export class VoucherLayoutError extends OneClickForAppError {}