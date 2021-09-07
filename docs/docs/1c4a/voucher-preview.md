---
title: Voucher Preview
---

You can create a preview voucher before checkout to check if the result matches
your expectations.

Preview is available for both PNG and PDF vouchers for a single voucher in
franking or address zone layout.

### PDF Preview

```typescript
const pageFormat = await internetmarke.getPageFormat(1);
const options: PreviewVoucherOptions = {
  pageFormat,
  voucherLayout: VoucherLayout.AddressZone
};
const product = await internetmarke.getProduct(1);

const previewLink = await internetmarke.retrievePreviewVoucher(product, options);
```

### PNG Preview

```typescript
const options: PreviewVoucherOptions = {
  voucherLayout: VoucherLayout.FrankingZone
};
const product = await internetmarke.getProduct(1);

const previewLink = await internetmarke.retrievePreviewVoucher(product, options);
```
