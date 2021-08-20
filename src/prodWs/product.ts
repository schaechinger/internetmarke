import { Amount } from '../utils/amount';

export interface ProductDataRange {
  min?: number;
  max?: number;
  unit?: string;
}

export interface Product {
  name: string;
  id: number;
  price: Amount | number;
  ppl: number;
  domestic: boolean;
  annotation?: string;
  dimensions?: {
    length: ProductDataRange;
    width: ProductDataRange;
    height: ProductDataRange;
  };
  weight?: ProductDataRange;
}

export const parseSalesProduct = (data: any): Product | null => {
  if (!data?.extendedIdentifier) {
    return null;
  }

  const product: Product = {
    id: +data.extendedIdentifier.externIdentifier.attributes.id,
    name: data.extendedIdentifier.externIdentifier.attributes.name,
    ppl: +data.extendedIdentifier.externIdentifier.attributes.actualPPLVersion,
    price: {
      value: +data.priceDefinition.price.calculatedGrossPrice.attributes.value,
      currency: data.priceDefinition.price.calculatedGrossPrice.attributes.currency
    },
    domestic: 'national' === data.extendedIdentifier.attributes.destination
  };

  // dimensions
  if (data.dimensionList) {
    product.dimensions = {
      length: {},
      width: {},
      height: {}
    };

    Object.keys(data.dimensionList).forEach(key => {
      const { minValue, maxValue, unit } = data.dimensionList[key].attributes;
      (product.dimensions as any)[key] = {
        min: +minValue,
        max: +maxValue,
        unit
      };
    });
  }

  // weight
  if (data.weight) {
    product.weight = {
      min: +data.weight.attributes.minValue,
      max: +data.weight.attributes.maxValue,
      unit: data.weight.attributes.unit
    };
  }

  // TODO: save properties? ratio, allowedForm etc.

  // TODO: save stamp type list?

  // TODO: save account prod references?

  return product;
};
