import { ProductPrice } from "../prodWs/product";
import { OrderPosition } from "./order";
import { Voucher } from "./voucher";

export interface ShoppingCart {
  shopOrderId?: number;
  voucherList: Voucher[];
}

export interface ShoppingCartSummary {
  positions: OrderPosition[];
  price: ProductPrice;
}
