import { PageFormatDimension } from '../1c4a/pageFormat';

export enum DinAPaper {
  Din4A0,
  Din2A0,
  DinA0,
  DinA1,
  DinA2,
  DinA3,
  DinA4,
  DinA5,
  DinA6,
  DinA7,
  DinA8,
  DinA9,
  DinA10
}

export type MeasurementSystem = 'METRIC' | 'IMPERIAL';
export type LengthUnit = 'mm' | 'in';
export type WeightUnit = 'g' | 'oz';

export interface PaperDimensions extends PageFormatDimension {
  unit: LengthUnit;
}

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface PaperDetailOptions {
  weight?: number;
  system?: MeasurementSystem;
}

const IMP_SIZE_FACTOR = 25.4;
const IMP_WEIGHT_FACTOR = 0.035274;

export interface PaperDetails {
  format: DinAPaper;
  dimensions: PaperDimensions;
  weight: Weight;
}

export const getPaperDetails = (
  format: DinAPaper,
  options: PaperDetailOptions = {}
): PaperDetails => {
  const paperOptions: PaperDetailOptions = {
    weight: 80,
    system: 'METRIC',
    ...options
  };

  const isImperial = 'IMPERIAL' === paperOptions.system;

  // TODO: convert custom weight for imperial

  // DIN 4A0 init
  const dimensions: PaperDimensions = {
    x: 1682,
    y: 2378,
    unit: 'mm'
  };

  for (let i = format; 0 < i; i -= 1) {
    const { y } = dimensions;
    dimensions.y = dimensions.x;
    dimensions.x = Math.floor(y / 2);
  }

  const weight: Weight = {
    value: (dimensions.x * dimensions.y * paperOptions.weight!) / 1000000,
    unit: 'g'
  };

  if (isImperial) {
    dimensions.x = +(dimensions.x / IMP_SIZE_FACTOR).toFixed(1);
    dimensions.y = +(dimensions.y / IMP_SIZE_FACTOR).toFixed(1);
    dimensions.unit = 'in';

    weight.value = +(weight.value * IMP_WEIGHT_FACTOR).toFixed(3);
    weight.unit = 'oz';
  } else {
    weight.value = +weight.value.toFixed(2);
  }

  return {
    format,
    dimensions,
    weight
  };
};
