import { ProductPrice } from "../prodWs/product";
import { AddressBinding } from "./address";
import { Voucher, VoucherLayout } from "./voucher";

export interface OrderPosition {
  productCode: number;
  voucherLayout: VoucherLayout;
  addressBinding?: AddressBinding;
  imageId?: number;
  additionalInfo?: string;
  price?: ProductPrice;
}

export interface ShoppingCart {
  shopOrderId?: number;
  voucherList: Voucher[];
}

export interface Order {
  link: string;
  manifestLink?: string;
  shoppingCart: ShoppingCart;
}
