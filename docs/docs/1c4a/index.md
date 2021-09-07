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

### Page Formats

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
const orderId = await internetmarke.createShopOrderId();
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

### Download Orders

You can download purchased vouchers with the response of `checkoutShoppingCart()`
or `retrieveOrder()` to make the files available on your machine.

PNG orders come bundled in a zip archive whereas PDF orders combine all
purchased vouchers in a single document. The filename is the same as the voucher
id for all PNG orders and PDF orders with just a single voucher. If a PDF order
contains more than one voucher the filename equals to the order id with a `im-`
prefix.

By default archives extract the containing vouchers and get removed afterwards.

The files are downloaded in the temp folder of your computer and create a
directory `node-internetmarke` however the download folder can be changed.

The response use an object that lists all voucher ids of the given order as keys
with the download path to the corresponding file. For PDF orders the path is
always the same.

```typescript
const options: DownloadOptions = {
  path, // optional, the path where the vouchers should be downloaded to
  deleteArchive, // optional, whether to delete the archive after extraction, defaults to true.
  extractArchive // optional, extract vouchers in an archive, defaults to true. If false, the archive does not get deleted in any case
};

// const order = await intermetmarke.retrieveOrder(1234);
const links = await internetmarke.downloadOrder(order, options);
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
