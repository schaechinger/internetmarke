---
title: User Info
---

As soon as this initialization is done you can access all the resources of the
1C4A service. In addtion to that you also have access to a few user properties
of your Portokasse account:

```typescript
const userInfo = await internetmarke.getUserInfo();
```

The user info holds all the information about your account including your wallet
balance.
In addition you can retrieve the order id of the latest order in this session.
