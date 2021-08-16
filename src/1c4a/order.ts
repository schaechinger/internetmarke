import { Amount } from '../utils/amount';
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
  ppl?: number;
}

export interface ShoppingCartSummary {
  positions: ShoppingCartItem[];
  total: Amount;
}

export interface Order {
  link: string;
  manifestLink?: string;
  walletBallance?: number;
  shoppingCart: {
    shopOrderId: number;
    vouchers: Voucher[];
  };
}

export const parseOrder = (data: any): Order | null => {
  if (!data?.shoppingCart) {
    return null;
  }

  const order: Order = {
    link: data.link,
    shoppingCart: {
      shopOrderId: +data.shoppingCart.shopOrderId,
      vouchers: data.shoppingCart.voucherList.voucher
    }
  };

  if (data.manifestLink) {
    order.manifestLink = data.manifestLink;
  }

  return order;
};
