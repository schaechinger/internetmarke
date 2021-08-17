const { CountryCode, Internetmarke, VoucherLayout } = require('..');

// To start this example directly make sure to build the project first:
// npm i && npm run build

(async () => {
  const internetmarke = new Internetmarke();

  // TODO: insert your credentials
  const userCredentials = {
    username: 'user-account@example.com',
    password: '********'
  };
  // TODO: insert your credentials
  const partnerCredentials = {
    id: 'PARTNER_ID',
    secret: 'SCHLUESSEL_DPWN_MARKTPLATZ',
    keyPhase: 1 // can be ignored as keyPhase defaults to 1
  };

  // TODO: define product or retrieve from ProdWS
  const product = {
    id: 1,
    price: 80
  };

  // init 1C4A / authenticateUser
  await internetmarke.initOneClickForAppService({
    user: userCredentials,
    partner: partnerCredentials,
    voucherLayout: VoucherLayout.AddressZone
  });

  // user info (walletBalance, orderIds purchased during this app run, etc.)
  console.log('user info', await internetmarke.getUserInfo());

  // page formats / retrievePageFormats
  const pageFormats = await internetmarke.retrievePageFormats();
  console.log('page formats', pageFormats.length, pageFormats[0]);

  // createShopOrderId
  const orderId = await internetmarke.createShopOrderId();
  console.log('generated order id', orderId);

  // public gallery images / retrievePublicGallery
  const publicGallery = await internetmarke.retrievePublicGallery();
  console.log('public gallery', publicGallery.length, publicGallery[0]);

  // private gallery images / retrievePrivateGallery
  const privateGallery = await internetmarke.retrievePrivateGallery();
  console.log('private gallery', privateGallery.length);

  // previewVoucher
  console.log('voucher AddressZone PNG', await internetmarke.retrievePreviewVoucher(product));
  console.log(
    'voucher FrankingZone PNG',
    await internetmarke.retrievePreviewVoucher(product, { voucherLayout: VoucherLayout.FrankingZone })
  );
  console.log(
    'voucher AddressZone PDF',
    await internetmarke.retrievePreviewVoucher(product, { pageFormat: pageFormats[0] })
  );
  console.log(
    'voucher FrankingZone PDF with image',
    await internetmarke.retrievePreviewVoucher(product, {
      voucherLayout: VoucherLayout.FrankingZone,
      imageItem: publicGallery[0].images[0]
    })
  );

  // retrieveOrder
  console.log(`order with id: ${orderId}`, await internetmarke.retrieveOrder(orderId));

  // checkout (dry run) / checkoutShoppingCart
  // add product in FrankingZone mode
  internetmarke.addItemToShoppingCart(product, { voucherLayout: VoucherLayout.FrankingZone });
  // add product with defined position (for PDF generation)
  internetmarke.addItemToShoppingCart(product, { position: { labelX: 1, labelY: 1, page: 1 } });
  // add product with address binding
  internetmarke.addItemToShoppingCart(product, {
    sender: {
      firstname: 'Max',
      lastname: 'Mustermann',
      street: 'Marienplatz',
      houseNo: '8',
      zip: '80331',
      city: 'München'
    },
    receiver: {
      company: 'Studio 42',
      firstname: 'John',
      lastname: 'Doe',
      street: 'Morningside Road',
      houseNo: '44',
      zip: 'EH10 4BF',
      city: 'Edinburgh',
      country: CountryCode.GBR
    }
  });
  const cart = internetmarke.getShoppingCartSummary();
  console.log('shopping cart summary', cart);

  // checkout in PDF mode (with given pageFormat template)
  // dryrun simulates the checkout and does not charge your account
  const order = await internetmarke.checkoutShoppingCart({ pageFormat: pageFormats[0], dryrun: true });
  console.log('order', order);
})();
