export interface CatalogItem {
  name: string;
  value: string | string[];
  properties?: { [name: string]: any };
}

export interface Catalog {
  id: string;
  shortName?: string;
  description?: string;
  items: CatalogItem[];
}

const getPropertyValue = (prop: any): any => {
  let value: any;
  if (undefined !== prop.alphanumericValue) {
    value = prop.alphanumericValue.attributes.fixValue;
  } else if (undefined !== prop.booleanValue) {
    value = 'true' === prop.booleanValue;
  } else if (undefined !== prop.dateValue) {
    value = (prop.dateValue && new Date(prop.dateValue.attributes.fixDate)) || null;
  } else {
    // throw new Error(`Unknown prop type: ${Object.keys(prop)[0]}`);
  }

  return value;
};

export const parseCatalog = (data: any): Catalog | null => {
  if (!data?.catalogValueList) {
    return null;
  }

  const catalog: Catalog = {
    id: data.attributes.name,
    items: []
  };

  if (data.attributes.shortName) {
    catalog.shortName = data.attributes.shortName;
  }
  if (data.attributes.description) {
    catalog.description = data.attributes.description;
  }

  data.catalogValueList.catalogValue.forEach((value: any) => {
    const catalogValue: CatalogItem = {
      name: value.name,
      value: value.value
    };
    if (-1 !== catalogValue.value.indexOf(',')) {
      catalogValue.value = value.value
        .split(',')
        .map((val: string) => val.substr(1, val.length - 2));
    }

    if (value.propertyList) {
      catalogValue.properties = {};
      const propertyList = Array.isArray(value.propertyList.property)
        ? value.propertyList.property
        : [value.propertyList.property];

      propertyList.forEach(prop => {
        const { name } = prop.attributes;
        const val = getPropertyValue(prop.propertyValue);
        if (!catalogValue.properties![name]) {
          catalogValue.properties![name] = val;
        } else {
          if (!Array.isArray(catalogValue.properties![name])) {
            catalogValue.properties![name] = [catalogValue.properties![name]];
          }

          catalogValue.properties![name].push(val);
        }
      });
    }

    catalog.items.push(catalogValue);
  });

  return catalog;
};
