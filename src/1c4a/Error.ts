/* eslint-disable max-classes-per-file */
import { InternetmarkeError } from '../Error';

export class OneClickForAppError extends InternetmarkeError {}

export class PartnerError extends OneClickForAppError {}

export class AddressError extends OneClickForAppError {}
export class CheckoutError extends OneClickForAppError {}
export class PageFormatError extends OneClickForAppError {}
export class ShoppingCartItemError extends OneClickForAppError {}
export class VoucherFormatError extends OneClickForAppError {}
export class VoucherLayoutError extends OneClickForAppError {}
