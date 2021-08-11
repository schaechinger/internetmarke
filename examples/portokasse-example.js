const { Internetmarke } = require('../lib/Internetmarke');
const { PaymentMethod } = require('../lib/portokasse/Service');

// To start this example directly make sure to build the project first:
// npm i && npm run build

(async () => {
  const internetmarke = new Internetmarke();

  // TODO: insert your credentials
  const userCredentials = {
    username: 'user-account@example.com',
    password: '********'
  };

  await internetmarke.initPortokasseService({ user: userCredentials });

  // basic user info (walletBalance) prior to 1C4A init
  console.log('user info', await internetmarke.getUserInfo());
  // this will fail as the minimum amount id EUR 10 / 1000 cents
  // this will prevent you account from being charged in this test
  try {
    const amount = { value: 5, currency: 'EUR' }; //or: const amount = 500
    await internetmarke.topUp(amount, PaymentMethod.Paypal)
  } catch { }
})();
