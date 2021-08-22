import { parsePropertyList } from './propertyList';

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

  const catalogValueList = Array.isArray(data.catalogValueList.catalogValue)
    ? data.catalogValueList.catalogValue
    : [data.catalogValueList.catalogValue];

  catalogValueList.forEach((value: any) => {
    const catalogValue: CatalogItem = {
      name: value.name,
      value: value.value
    };
    if ((catalogValue.value as string).match(/^'.*'$/)) {
      catalogValue.value = value.value
        .split(',')
        .map((val: string) => val.substr(1, val.length - 2));
    }

    if (value.propertyList) {
      catalogValue.properties = parsePropertyList(value.propertyList);
    }

    catalog.items.push(catalogValue);
  });

  return catalog;
};
