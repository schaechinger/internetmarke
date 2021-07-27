import { Amount } from '../prodWs/product';
import { AddressBinding } from './address';
import { PageFormatPosition } from './pageFormat';
import { Voucher, VoucherLayout } from './voucher';

export interface ShoppingCartItem {
  productCode: number;
  voucherLayout?: VoucherLayout;
  address?: AddressBinding;
  imageID?: number;
  additionalInfo?: string;
  position?: PageFormatPosition;
  price?: Amount;
}

export interface ShoppingCart {
  shopOrderId?: number;
  voucherList: {
    voucher: Voucher[];
  };
}

export interface ShoppingCartSummary {
  positions: ShoppingCartItem[];
  price: Amount;
}

export interface Order {
  link: string;
  manifestLink?: string;
  walletBallance: number;
  shoppingCart: ShoppingCart;
}
