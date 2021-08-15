const { Internetmarke } = require('..');

// To start this example directly make sure to build the project first:
// npm i && npm run build

(async () => {
  const internetmarke = new Internetmarke();

  // TODO: insert your credentials
  const clientCredentials = {
    username: 'username',
    password: '********'
  };

  // init ProdWS
  await internetmarke.initProductService({ client: clientCredentials });

  // list available products / getProductList
  const productList = await internetmarke.getProductList();
  console.log('productList length:', productList.length, productList[0]);

  // get product by id
  const product = await internetmarke.getProduct(1);
  console.log('getProduct', product);
})();
