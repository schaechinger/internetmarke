# Internetmarke [![NPM version][npm-svg]][npm-url] [![Workflow Status][workflow-svg]][workflow-url] [![Test Coverage][codecov-svg]][codecov-url]

A node implementation to use the Internetmarke web service of Deutsche Post.

- [Installation](#installation)
- [Prerequisites / Required Accounts](#prerequisites--required-accounts)
- [Usage](#usage)
- [1C4A (One Click For Application Service)](#1c4a-one-click-for-application-service)
  - [User Info](#user-info)
  - [Page Formats (PDF only)](#page-formats-pdf-only)
  - [Create Order Id](#create-order-id)
  - [Public Gallery Images](#public-gallery-images)
  - [Private Gallery Images](#private-gallery-images)
  - [Voucher Preview](#voucher-preview)
  - [Managing the Shopping Cart](#managing-the-shopping-cart)
  - [Checkout Shopping Cart and Place Order](#checkout-shopping-cart-and-place-order)
  - [Retrieve Older Orders](#retrieve-older-orders)
  - [Addresses](#addresses)
- [Portokasse Service](#portokasse-service)
  - [Wallet Overview](#wallet-overview)
  - [Top Up Account](#top-up-account)
- [ProdWS (Product Service)](#prodws-product-service)
  - [Retrieve Product List](#retrieve-product-list)
  - [Retrieve Oudated Products](#retrieve-outdated-products)

## Installation

To add internetmarke to your project use npm:

```bash
npm install internetmarke
```

## Prerequisites / Required Accounts

To use the module you have to request a partner account from Deutsche Post for
every web service you want to use and your payment account:

- **1C4A** (One Click For Application, required!) is used to order and preview
  vouchers.

  You can get the partner account from the website of [Deutsche Post][post-1c4a]
  or request one via mail: `pcf-1click@deutschepost.de`

  This account credentials refer to `PartnerCredentials`.

- **Prod WS** (Product List Web Service) is used to retrieve the list of
  available products (the distinct types of stamps for different dimensions
  etc.). This is optional if you know the ids and prices of the vouchers you
  want to order but recommended as it is easier and supports automatic voucher
  updates when prices change.

  The client account can be requested via mail (see above) only.
  This account credentials refer to `ClientCredentials`.

- Further you need your personal **Portokasse** account with payment information
  that is used on checkout. If you do not have one please create one at the web
  ortal of [Deutsche Post][post-portokasse].

  This account credentials refer to `UserCredentials`. For testing use you can
  request a test account via the above email address to test voucher generation
  without charging your own account for three months. These generated vouchers
  are then not valid to be used in production!

## Usage

Internetmarke so far handles three services, the One Click For App (1C4A)
Service that handles the voucher checkout process, the Product Service (ProdWS)
that is capable of available products (types of vouchers) and the Portokasse
service to top up the user account to order more vouchers.

Each service can be used separately and has therefore to be initialized with a
specific method call before it can be used. Afterwards you can use the returned
service instance or the internetmarke instance to call the supported service
methods.

**Examples:** Can be found in the `examples` directory for easy adoption.

All the examples here are written in TypeScript but of course the package can be
used with JavaScript as well. See `examples/complete-example.js`.

```typescript
import { Internetmarke } from 'internetmarke';
// or: const { Internetmarke } = require('internetmarke');

const internetmarke = new Internetmarke();

// use 1C4A service
// const oneC4AOptions = { partner: ..., user: ... }
await internetmarke.initOneClickForAppService(oneC4AOptions);

// use Portokasse service
// const portokasseOptions = { user: ... }
await internetmarke.initOneClickForAppService(portokasseOptions);

// use ProdWS service
// const prodWsOptions = { client: ... }
await internetmarke.initProductService(prodWsOptions);
```

## 1C4A (One Click For Application Service)

To setup the 1C4A service, call the method `initOneClickForAppService(options)`
of the Internetmarke main instance.

Pass the credentials of your partner and user (Portokasse) accounts to connect
to the 1C4A service.

You can optionally add the default voucher layout for the following orders.

```typescript
const options: OneClickForAppOptions = {
  partner: {
    id: 'PARTNER_ID',
    secret: 'SCHLUESSEL_DPWN_MARKTPLATZ'
  },
  user: {
    username: 'user-account@example.com',
    password: '*****'
  },
  voucherLayout: VoucherLayout.AddressZone // optional, the default voucher layout for all vouchers
};

// this method returns the 1C4A service instance which can be used for all
// related methods as well as the internetmarke instance itself
await internetmarke.initOneClickForAppService(options);
```

### User Info

As soon as this initialization is done you can access all the resources of the
1C4A service. In addtion to that you also have access to a few user properties
of your Portokasse account:

```typescript
const userInfo = await internetmarke.getUserInfo();
```

The user info holds all the information about your account including your wallet
balance.
In addition you can retrieve the order id of the latest order in this session.

### Page Formats (PDF only)

If you wish to generate vouchers in PDF format you may want to list all the
available page templates from the service.

```typescript
const pageFormats = await internetmarke.retrievePageFormats();

// get pageFormat by id
const pageFormat = await internetmarke.retrievePageFormat(1);
```

### Create Order Id

In some cases it might be useful to generate the order id for the next order
before the checkout. This is what the method `createShopOrderId()` is for:

```typescript
const orderId = await internetmarke.createOrderId();
```

This order id can be passed to the `checkoutShoppingCart()` method in the
options object.

### Public Gallery Images

The Deutsche Post provides a list of image categories with a few images that
can be accessed by everyone and added to a voucher in FrankingZone mode.

```typescript
const gallery = await internetmarke.retrievePublicGallery();
```

### Private Gallery Images

Same as with the public gallery you can access the images of your private
gallery that have been uploaded to Deutsche Post before. There are no
categories but only a list of images.

```typescript
const gallery = await internetmarke.retrievePrivateGallery();
```

### Voucher Preview

You can create a preview voucher before checkout to check if the result matches
your imaginations.

```typescript
const options: PreviewVoucherOptions = {
  pageFormat, // optional, the page format template object if you want to generate a PDF, PNG will be used if none is provided
  imageItem, // optional, the image item object to attach an image from a gallery to the voucher
  voucherLayout: VoucherLayout.FrankingZone // optional if already defined during service init
};

// get product from product service of hand over an obect with the id only
// const product = await internetmarke.getProduct(1);
const previeLink = await internetmarke.retrievePreviewVoucher(product, options);
```

### Managing the Shopping Cart

Before the checkout you have to add items to the local shopping cart. This can
be achieved with this method.

```typescript
const options: ShoppingCartItemOptions = {
  imageItem, // optional, the image item object to attach an image from a gallery to the voucher
  voucherLayout: VoucherLayout.FrankingZone // optional if already defined during service init
  position, // optional, the position information object if you want to generate a PDF and need a specific position. Otherwise vouchers will be positioned automatically
  sender, // optional, the sender address in SimpleAddress format including name and company if applicable
  receiver, // optional, the receiver address in SimpleAddress format. Mandatory if sender is given
};

// get product from product service of hand over an obect with the id only
// const product = await internetmarke.getProduct(1);
const itemIndex = internetmarke.addItemToShoppingCart(product, options);
```

After you added an item to the shopping cart you can remove or retrieve it's
data with the retrieved index from the `addItemToShoppingCart()` method.

```typescript
// get shopping cart item info
const item = internetmarke.getItemFromShoppingCard(index);
// remove shopping cart item from the cart, this will also retrieve the deleted item
internetmarke.removeItemFromShoppingCard(index);

// get a brief summary of the current shopping cart items
const cart = this.getShoppingCartSummary();
```

### Checkout Shopping Cart and Place Order

As soon as you have items in your shopping cart you can order those.
This is the main method where the virtual shopping cart is pushed to the
service, the vouchers are being generated and your Portokasse account gets
charged with the total shopping cart amount.

However you can use the `dryrun` option to just validate the shopping cart and
log the request payload to the debug namespace `internetmarke:1c4a`.

```typescript
const options: CheckoutShoppingCartOptions = {
  shopOrderId, // optional, the pre-generated order id that should be used
  pageFormat, // optional, the page format template object if you want to generate a PDF, PNG will be used if none is provided
  createManifest, // optional, indicates whether to include a manifest PDF to the order
  createShippingList, // optional, attach a shipping list with or without addresses
  dryrun // optional, simulate checkout and do NOT send a request to the service. This will only validate the shopping cart locally
};

const order = await internetmarke.checkoutShoppingCart(options);
```

### Retrieve Older Orders

Every order can be re-downloaded with their unique order id. The output is the
same as from the `checkoutShoppingCart()` method.

```typescript
const order = await internetmarke.retrieveOrder(orderId);
```

### Addresses

Addresses can be passed in `SimpleAddress` format which is flat and does not
contain the structure for the backend services. This will be used to generate
the final address objects

```typescript
const simple: SimpleAddress = {
  company: 'Augustiner-Bräu Wagner KG',
  salutation: 'Herrn',
  title: 'Dr.',
  firstname: 'Martin',
  lastname: 'Leibhard',
  additional: 'Leitung',
  street: 'Landsberger Straße',
  houseNo: '31-35',
  zip: '80339',
  city: 'München'
};

// this will be translated into the final NamedAddress structure:
const namedAddress: NamedAddress = {
  name: {
    companyName: {
      company: 'Augustiner-Bräu Wagner KG',
      personName: {
        salutation: 'Herrn',
        title: 'Dr.',
        firstname: 'Martin',
        lastname: 'Leibhard'
      }
    }
  },
  address: {
    additional: 'Leitung',
    street: 'Landsberger Straße',
    houseNo: '31-35',
    zip: '80339',
    city: 'München',
    country: 'DEU'
  }
};
```

## Portokasse Service

### Wallet Overview

The `wallet-overview` api endpoint retrieves the wallet balance same as the user
account provided by the 1C4A service. To retrieve this information use the same
method `getUserInfo` as you do to retrieve [1C4A user informtion](#user-info)
mentioned above. Depending of which services you enabled this will return the
data from the 1C4A or the Portokasse service. If you however initialized both
accounts it will merge the information from 1C4A with the live wallet balance
from the Portokasse service.

### Top Up Account

## ProdWS (Product Service)

The product list contains all available vouchers that can be ordered. They are
cached and are get updated once a week if not configured otherwise.
To access the product service (Prod WS) a dedicated client account is necessary.

```typescript
const options: ProductServiceOptions = {
  client: {
    username: 'username',
    password: '********',
    id: 'USERNAME' // optional, if the id matches the uppercase version of your username
  },
  ttl: 24 * 3600 // optional, seconds the products will be cached. Defaults to seven days
};

// this method returns the 1C4A service instance which can be used for all
// related methods as well as the internetmarke instance itself
await internetmarke.initProductService(options);
```

If your id (`Mandant-ID`) differs from the upper case version of the username
you can add it to the client credentials.

### Retrieve Product List

Once the product service is initialized you can retrieve the whole product list
or a single product from the webservice. You can also query one single product
if you know the specific product id.

```typescript
const products = await internetmarke.getProductList();
const product = await internetmarke.getProduct(1);
```

### Retrieve Outdated Products

If you however want to retrieve an older product list you can optionally pass a
date that defines the historical date of product list on this date.
If you request an outdated product list this will disable the cache for this
request and request the list on every request which can take a few seconds to
load the data. As of now you cannot request an old product by id so if you look
for a special product of an older date just request the whole list and iterate
through it afterwards and find the right product.

```typescript
const oldProducts = await internetmarke.getProductList(new Date('2018-02-01'));
```

[npm-url]: https://npmjs.org/package/internetmarke
[npm-svg]: https://img.shields.io/npm/v/internetmarke.svg
[npm-downloads-svg]: https://img.shields.io/npm/dm/internetmarke.svg
[workflow-url]: https://github.com/schaechinger/internetmarke/actions/workflows/qa.yml
[workflow-svg]: https://img.shields.io/github/workflow/status/schaechinger/internetmarke/qa
[codecov-svg]: https://codecov.io/gh/schaechinger/internetmarke/branch/master/graph/badge.svg?token=44611cZi5g
[codecov-url]: https://codecov.io/gh/schaechinger/internetmarke
[license-svg]: https://img.shields.io/npm/l/internetmarke.svg
[dependencies-svg]: https://img.shields.io/david/schaechinger/internetmarke.svg
[post-1c4a]: https://www.deutschepost.de/de/i/internetmarke-porto-drucken/partner-werden.html
[post-portokasse]: https://portokasse.deutschepost.de/portokasse/#!/register/
