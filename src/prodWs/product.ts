export interface ProductDataRange {
  min?: number;
  max?: number;
  unit?: string;
}

export interface Amount {
  value: number;
  currency: string;
}

export interface Product {
  name: string;
  id: number;
  price: Amount;
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

export const parseProducts = (rawData: any): { [id: number]: Product } => {
  if (!rawData) {
    return {};
  }

  const products: { [id: number]: Product } = {};

  rawData.salesProductList.SalesProduct.forEach((data: any) => {
    if (data.extendedIdentifier) {
      const product: Product = {
        id: +data.extendedIdentifier.externIdentifier.attributes.id,
        name: data.extendedIdentifier.externIdentifier.attributes.name,
        ppl: +data.extendedIdentifier.externIdentifier.attributes.actualPPLVersion,
        price: {
          value: +data.priceDefinition.price.calculatedGrossPrice.attributes.value,
          currency: data.priceDefinition.price.calculatedGrossPrice.attributes.currency
        },
        domestic: 'national' === data.extendedIdentifier.destination
      };

      // dimensions
      if (data.dimensionList) {
        product.dimensions = {
          length: {},
          width: {},
          height: {}
        };

        for (const key in data.dimensionList) {
          const { minValue, maxValue, unit } = data.dimensionList[key].attributes;
          (product.dimensions as any)[key] = {
            min: +minValue,
            max: +maxValue,
            unit
          };
        }
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

      products[product.id] = product;
    }
  });

  return products;
};
