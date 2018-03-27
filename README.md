# internetmarke

[![Build Status][travis-svg]][travis-url]
[![Test Coverage][coveralls-svg]][coveralls-url]
[![NPM version][npm-svg]][npm-url]

![License][license-svg]
![Dependencies][dependencies-svg]

A node wrapper for the Internetmarke web service of the Deutsche Post


## Installation

```sh
npm i internetmarke
```


## Required accounts

To use the module you have to request a partner account from Deutsche Post for every web service you want to use and your payment account:

* **1C4A** (One Click For Application, required!) is used to order vouchers.

  You can get the partner account from the website of [Deutsche Post][post-1c4a] or via mail: pcf-1click@deutschepost.de

* **Prod WS** (Product List Web Service) is used to retrieve the list of available products (the distinct types of stamps for different dimensions etc.). This is optional if you know the ids and prices of the vouchers you want to order.

  The client account can be requested via mail (see above) only.

* Further you need your personal **Portokasse** account with payment info that is used on checkout. If you do not have one please create one at the web portal of [Deutsche Post][post-portokasse]


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

If your `keyPhase` is different that `1` please add it to the factory method.


### Create internetmarke instance

You can do so by handing the created partner to the Internetmarke constructor. This will connect you to the 1C4A service.

```javascript
const Internetmarke = require('internetmarke');

const internermarke = new Internetmarke(partner);
```


### Authenticate user

Once the partner credentials have been set, you can login with your user account that should be used for the payment.

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

The user holds all the information about your account including your wallet balance, which you can retrieve with `user.getBalance()` as soon as you authenticated the user. The user is passed by reference along the process so you can keep track of the balance with your instance after every checkout.

In addition you can retrieve the order id of the latest order in this session with `user.getOrderId()`.


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

#### Voucher preview

You can create a preview voucher before checkout.

```javascript
internetmarke.getVoucherPreview({ product })
  .then({ link } => {
    // link to the deutsche post service that contains the preview image for the product
  });
```

Of course you can also use `productCode` instead of the `product` here.


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

#### Retrieve older orders

Every order can be re-downloaded with their order id.

```javascript
internetmarke.retrieveOrder({ orderId: 1234 })
  .then(shoppingcart => {
    // same structure as checkout
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


[post-1c4a]: https://www.deutschepost.de/de/i/internetmarke-porto-drucken/partner-werden.html
[post-portokasse]: https://portokasse.deutschepost.de/portokasse/#!/register/
