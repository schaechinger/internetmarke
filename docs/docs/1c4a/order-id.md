---
title: Create Order Id
---

In some cases it might be useful to generate the order id for the next order
before the checkout. This is what the method `createShopOrderId()` is for:

```typescript
const orderId = await internetmarke.createShopOrderId();
```

The order id is numeric and unique system wide. Every order id is assigned to
the partner account that created it so you cannot retrieve orders from other
accounts with only thr order id.

This order id can be passed to the `checkoutShoppingCart()` method in the
options object.
