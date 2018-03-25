# internetmarke

[![Build Status][travis-svg]][travis-url]
[![Build Status][coveralls-svg]][coveralls-url]
[![NPM version][npm-svg]][npm-url]

![License][license-svg]
![Dependencies][dependencies-svg]

A node wrapper for the Internetmarke web service of the Deutsche Post


## Installation

```sh
npm install internetmarke
```


## Required accounts

To use the module you have to request a partner account.
You can get one from the website of the Deutsche Post or via mail.

Second, an account is required that is used to pay the vouchers.


## Basic usage

### Declare partner

Init the internetmarke object with your partner credentials.
You can request them on the page of the Deutsche Post.

```javascript
const factory = require('internetmarke').factory;

const partner = factory.createPartner({
  id: 'PARTNER_ID',
  secret: 'SCHLUESSEL_DPWN_MARKTPLATZ'
});
```


### Create internetmarke instance

```javascript
const Internetmarke = require('internetmarke');

const internermarke = new Internetmarke(partner);
```


### Authenticate user

Once the partner credentials have been set, you can login with your account that should be used for the payment.

```javascript
const user = factory.createUser({
  username: 'user-account@example.com',
  password: '*****'
});
internetmarke.authenticateUser(user)
  .then(success => {
    // user is authenticated
  });
```


### Product list

The product list contains all available vouchers that can be ordered. They are cached and are get updated once a day.
To access the product service (Prod WS) a dedicated client account is necessary!

```javascript
const client = factory.createClient({
  username: 'USERNAME',
  password: '********'
});
```

If your id (`Mandant-ID`) differs from the upper case version of the username you can add it to the factory method.

To enable the product service hand your client account to the internetmarke instance.

```javascript
internetmarke.enableProductService({ client })
  .then(success => {
    // you can now access the product list
  });
```

Once the product service is enable you can retrieve the whole product list or a single product.

```javascript
internetmarke.getProductList()
  .then(productList => {
    // array of products
  });

internetmarke.findProduct({ id: 1})
  .then(product => {
    // product.getId() contains the id used to order a voucher
    // product.getName() is the readable name of the product
    // product.getPrice() contains the price in Euro Cents
  });
```

You can get the minimal and maximal dimensions and weight informations of every product with the properties `_dimensions` and `_weight`. This will be used to match a product with given packet information to retrieve the best fitting product.


### Order vouchers

As soon as the user has been authenticated you can start ordering vouchers.
You can set the `productCode` and the `voucherLayout` (Default is Address Zone) for every single voucher.

To determine the right voucher, you can use the product list.

```javascript
internetmarke.orderVoucher({ product });
```

If you do not have a product from the product service you can use `productCode` and `price` instead to order a voucher.


### Checkout

Once done, you can proceed with the checkout which will buy the vouchers and return the information including a link to the zip file.

```javascript
internetmarke.checkout()
  .then(shoppingcart => {
    // shoppingcart.orderId
    // shoppingcart.link - contains the link to the zip archive
    // shoppingcart.vouchers[].id - used to regenerate the voucher
    // shoppingcart.vouchers[].trackingCode (depending on product)
  });
```


### Retrieve older orders

Every order can be re-downloaded with the order id.

```javascript
internetmarke.retrieveOrder({ orderId: 1234 })
  .then(shoppingcart => {

  });
```


### Add addresses to a voucher

Vouchers that are in `AddressZone` Layout can handle addresses.
You can add a pair of sender / receiver addresses with the AddressFactory.

```javascript
const sender = factory.createAddress({
  firstname: 'Max',
  lastname: 'Mustermann',
  street: 'Marienplatz',
  houseNo: 1,
  zip: 80331,
  city: 'München'
});
const receiver = factory.createAddress({
  company: 'Studio 42',
  firstname: 'John',
  lastname: 'Doe',
  street: 'Morningside Road',
  houseNo: 44,
  zip: 'EH10 4BF'
  city: 'Edinburgh'
  country: 'GBR'
});
const addressBinding = factory.bindAddresses({ receiver, sender});

internetmarke.orderVoucher({
  addressBinding
  /** further voucher info ... **/
});
```


[npm-url]: https://npmjs.org/package/internetmarke
[npm-svg]: https://img.shields.io/npm/v/internetmarke.svg
[npm-downloads-svg]: https://img.shields.io/npm/dm/internetmarke.svg

[travis-url]: https://travis-ci.org/schaechinger/internetmarke
[travis-svg]: https://img.shields.io/travis/schaechinger/internetmarke/master.svg

[license-svg]: https://img.shields.io/npm/l/internetmarke.svg

[dependencies-svg]: https://img.shields.io/david/schaechinger/internetmarke.svg

[coveralls-url]: https://coveralls.io/github/schaechinger/internetmarke
[coveralls-svg]:  https://img.shields.io/coveralls/github/schaechinger/internetmarke.svg
