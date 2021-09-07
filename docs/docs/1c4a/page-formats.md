---
title: Page Formats
---

If you wish to generate vouchers in PDF format you may want to list all the
available page templates from the service.

```typescript
const pageFormats = await internetmarke.retrievePageFormats();

// get pageFormat by id
const pageFormat = await internetmarke.retrievePageFormat(1);
```
