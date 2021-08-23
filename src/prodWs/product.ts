import { Amount } from '../utils/amount';
import {
  Dimension,
  DinEnvelope,
  DinPaper,
  getPaperDetails,
  PaperDetailOptions,
  Weight
} from './paper';
import { parsePropertyList } from './propertyList';

export interface ProductDataRange<T> {
  min: T | null;
  max: T | null;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height?: number;
  unit: string;
}

export interface Product {
  name: string;
  id: number;
  price: Amount | number;
  ppl: number;
  domestic: boolean;
  registered: boolean;
  priority: boolean;
  tracking: boolean;
  annotation?: string;
  dimensions?: ProductDataRange<ProductDimensions>;
  weight?: ProductDataRange<Weight>;
  properties?: { [name: string]: any };
}

export interface MatchProductOptions {
  pages: number;
  paper?:
    | {
        // defaults to 'A4'
        format?: DinPaper;
        grammage?: number;
      }
    | DinPaper;
  envelope?:
    | {
        // defaults to 'DL'
        format?: DinEnvelope;
        grammage?: number;
      }
    | DinEnvelope;
  // defaults to true
  domestic?: boolean;
  // defaults to false
  priority?: boolean;
  // defaults to false
  registered?: boolean;
  // defaults to false
  tracking?: boolean;
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
    domestic: 'national' === data.extendedIdentifier.attributes.destination,
    registered: false,
    priority: false,
    tracking: false
  };

  // dimensions
  if (data.dimensionList) {
    product.dimensions = {
      min: {
        width: +data.dimensionList.width.attributes.minValue,
        length: +data.dimensionList.length.attributes.minValue,
        unit: data.dimensionList.width.attributes.unit
      },
      max: {
        width: +data.dimensionList.width.attributes.maxValue,
        length: +data.dimensionList.length.attributes.maxValue,
        unit: data.dimensionList.width.attributes.unit
      }
    };

    if (data.dimensionList.height) {
      product.dimensions.min!.height = +data.dimensionList.height.attributes.minValue;
      product.dimensions.max!.height = +data.dimensionList.height.attributes.maxValue;
    }
  }

  // weight
  if (data.weight) {
    product.weight = {
      min: {
        value: +data.weight.attributes.minValue,
        unit: data.weight.attributes.unit
      },
      max: {
        value: +data.weight.attributes.maxValue,
        unit: data.weight.attributes.unit
      }
    };
  }

  // properties
  if (data.propertyList) {
    product.properties = parsePropertyList(data.propertyList);
  }

  // stamp type properties
  if (data.stampTypeList && data.stampTypeList.stampType) {
    const list = Array.isArray(data.stampTypeList.stampType)
      ? data.stampTypeList.stampType
      : [data.stampTypeList.stampType];
    list.forEach(stampType => {
      if ('Internetmarke' === stampType.attributes.name) {
        product.properties = {
          ...(product.properties || {}),
          ...parsePropertyList(stampType.propertyList)
        };
      }
    });
  }

  product.registered = 'R' === product.properties?.StampTypeCharacter;
  product.priority = 'H' === product.properties?.StampTypeCharacter;
  product.tracking = !!product.properties?.extProp_Sendungsverfolgung;

  return product;
};

const dimensionToArray = (dimension: ProductDimensions): number[] => {
  const array = Object.values(dimension)
    .filter(n => 'number' === typeof n)
    .sort((a, b) => (a <= b ? -1 : 1));

  return array.slice(-2);
};

const fitsDimensions = (
  dimension: Dimension,
  range: ProductDataRange<ProductDimensions>
): boolean => {
  if (range.min) {
    const min = dimensionToArray(range.min);
    for (let i = 0; min.length > i; i += 1) {
      if (min[i] > dimension.size[i]) {
        return false;
      }
    }
  }

  if (range.max) {
    const max = dimensionToArray(range.max);
    for (let i = 0; max.length > i; i += 1) {
      if (max[i] < dimension.size[i]) {
        return false;
      }
    }
  }

  return true;
};

const fitsWeight = (weight: Weight, range: ProductDataRange<Weight>): boolean => {
  if (range.min && range.min.value > weight.value) {
    return false;
  }
  if (range.max && range.max.value < weight.value) {
    return false;
  }

  return true;
};

export const matchProduct = (products: Product[], options: MatchProductOptions): Product | null => {
  const matchOptions: MatchProductOptions = {
    envelope: {},
    paper: {},
    domestic: true,
    priority: false,
    registered: false,
    tracking: false,
    ...options
  };
  if ('string' === typeof matchOptions.paper) {
    matchOptions.paper = { format: matchOptions.paper };
  }
  if ('string' === typeof matchOptions.envelope) {
    matchOptions.envelope = { format: matchOptions.envelope };
  }
  matchOptions.paper!.format = matchOptions.paper!.format || DinPaper.DinA4;
  matchOptions.envelope!.format = matchOptions.envelope!.format || DinEnvelope.DinLang;

  const paperOptions: PaperDetailOptions = {};
  if (matchOptions.paper!.grammage) {
    paperOptions.grammage = matchOptions.paper!.grammage;
  }
  const paperDetails = getPaperDetails(matchOptions.paper!.format, paperOptions)!;

  const envelopeOptions: PaperDetailOptions = {};
  if (matchOptions.envelope!.grammage) {
    envelopeOptions.grammage = matchOptions.envelope!.grammage;
  }
  const envelopeDetails = getPaperDetails(matchOptions.envelope!.format, envelopeOptions);

  const weight = paperDetails.weight.value * options.pages + (envelopeDetails?.weight.value || 0);
  const dimensions = envelopeDetails?.dimensions || paperDetails.dimensions;

  const validProducts = products.filter(product => {
    if (product.domestic !== matchOptions.domestic) {
      return false;
    }
    if (matchOptions.registered && product.registered !== matchOptions.registered) {
      return false;
    }
    if (product.priority !== matchOptions.priority) {
      return false;
    }
    if (matchOptions.tracking && product.tracking !== matchOptions.tracking) {
      return false;
    }

    if (product.dimensions && !fitsDimensions(dimensions, product.dimensions)) {
      return false;
    }

    if (product.weight && !fitsWeight({ value: weight, unit: 'g' }, product.weight)) {
      return false;
    }
    if (
      product.properties?.Grammage &&
      !fitsWeight(paperDetails.grammage, product.properties.Grammage)
    ) {
      return false;
    }

    if (product.properties) {
      if (
        product.properties.MinRatio &&
        product.properties.MinRatio > dimensions.size[1] / dimensions.size[0]
      ) {
        return false;
      }
    }

    return true;
  });
  // .sort((a, b) => {
  //   // sort valid products by price
  //   return (a.price as Amount).value <= (b.price as Amount).value ? -1 : 1;
  // });

  return validProducts[0] || null;
};
