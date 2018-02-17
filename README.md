# internetmarke

[![Build Status](https://travis-ci.org/schaechinger/internetmarke.svg?branch=master)](https://travis-ci.org/schaechinger/internetmarke)

A node wrapper for the Internetmarke web service of the Deutsche Post

## Required accounts

To use the module you have to request a partner account.
You can get one from the website of the Deutsche Post or via mail.

Second, an account is required that is used to pay the vouchers.

## Basic usage

### Declare partner

Init the internetmarke object with your partner credentials.
You can request them on the page of the Deutsche Post.

```javascript
const Internetmarke = require('internetmarke');
const { Partner, User } = Internetmarke;

const partner = new Partner({
  id: 'PARTNER_ID',
  secret: 'SCHLUESSEL_DPWN_MARKTPLATZ'
});
const internermarke = new Internetmarke(partner);
```

### Authenticate user

Once the partner credentials have been set, you can login with your account that should be used for the payment.

```javascript
const user = new User({
  username: 'user-account@example.com',
  password: '*****'
});
internetmarke.authenticateUser(user);
  .then(() => {
    // user is authenticated
  });
```

### Order vouchers

As soon as the user has been authenticated you can start ordering vouchers.
You can set the `productCode` and the `voucherLayout` (Default is Address Zone) for every single voucher.

To determine the right voucher, you can use the product list.

```javascript
internermarke.orderVoucher({
  productCode: 1
});
```

### Checkout

Once done, you can proceed with the checkout which will buy the vouchers and return the information including a link to the zip file.

```javascript
internetmarke.checkout()
  .then(shoppingcart => {
    // shoppingcard.orderId
    // shoppingcard.link
    // shoppingcard.vouchers[].id
    // shoppingcard.vouchers[].trackingCode (depending on product)
  });
```
