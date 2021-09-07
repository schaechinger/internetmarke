---
title: Getting Started
---

## Installation

To add internetmarke to your project use npm:

```bash
npm i internetmarke
```

## Prerequisites

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
