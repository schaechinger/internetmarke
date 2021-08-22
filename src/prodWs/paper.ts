export enum DinPaper {
  DinA0 = 'A0',
  DinA1 = 'A1',
  DinA2 = 'A2',
  DinA3 = 'A3',
  DinA4 = 'A4',
  DinA5 = 'A5',
  DinA6 = 'A6',
  DinA7 = 'A7',
  DinA8 = 'A8',
  DinA9 = 'A9',
  DinA10 = 'A10'
}

export enum DinEnvelope {
  DinB4 = 'B4',
  DinB5 = 'B5',
  DinB6 = 'B6',
  DinC4 = 'C4',
  DinC5 = 'C5',
  DinC6 = 'C6',
  DinLang = 'DL',
  None = 'NONE'
}

export type DinFormat = DinPaper | DinEnvelope;

export type MeasurementSystem = 'METRIC' | 'IMPERIAL';
export type LengthUnit = 'mm' | 'in';
export type WeightUnit = 'g' | 'oz' | 'g/m²';

export interface Dimension {
  size: number[];
  unit: LengthUnit;
}

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface PaperDetailOptions {
  /** The paper strength in g/m². Defaults to 80 for paper, 90 for envelopes and 150 for postcards. */
  grammage?: number;
  /** The applied measurement system for the ouput. Defaults to 'METRIC'. */
  system?: MeasurementSystem;
}

const IMP_SIZE_FACTOR = 25.4;
const IMP_WEIGHT_FACTOR = 0.035274;

const SeriesInit = {
  A: [841, 1189],
  B: [1000, 1414],
  C: [917, 1297],
  // D: [771, 1091],
  DL: [110, 220]
};

export interface PaperDetails {
  format: DinFormat;
  dimensions: Dimension;
  weight: Weight;
  grammage: Weight;
}

const getPaperDimensions = (format: DinFormat): Dimension => {
  const match = format.match(/^([A-C]|DL)(\d*)$/i)!;
  const formatId = match[2] ? +match[2] : 0;

  const dimensions: Dimension = {
    size: SeriesInit[match[1]],
    unit: 'mm'
  };

  for (let i = formatId; 0 < i; i -= 1) {
    const [x, y] = dimensions.size;
    dimensions.size = [Math.floor(y / 2), x];
  }

  return dimensions;
};

export const getPaperDetails = (
  format: DinFormat,
  options: PaperDetailOptions = {}
): PaperDetails | null => {
  if (DinEnvelope.None === format) {
    return null;
  }

  const paperOptions: PaperDetailOptions = {
    grammage: 80,
    system: 'METRIC',
    ...options
  };

  const series = format.match(/^[A-C]|DL/i)!;
  const isEnvelope = ['B', 'C', 'DL'].includes(series[0]);

  // envelopes
  if (isEnvelope) {
    if (!options.grammage) {
      paperOptions.grammage = 90;
    }
  }

  const isImperial = 'IMPERIAL' === paperOptions.system;

  // TODO: convert custom weight for imperial

  const dimensions = getPaperDimensions(format);

  const weight: Weight = {
    value: (dimensions.size[0] * dimensions.size[1] * paperOptions.grammage!) / 1000000,
    unit: 'g'
  };
  if (isEnvelope) {
    weight.value *= 2;
  }

  const grammage: Weight = {
    value: paperOptions.grammage!,
    unit: 'g/m²'
  };

  if (isImperial) {
    dimensions.size[0] = +(dimensions.size[0] / IMP_SIZE_FACTOR).toFixed(1);
    dimensions.size[1] = +(dimensions.size[1] / IMP_SIZE_FACTOR).toFixed(1);
    dimensions.unit = 'in';

    weight.value = +(weight.value * IMP_WEIGHT_FACTOR).toFixed(3);
    weight.unit = 'oz';
  } else {
    weight.value = +weight.value.toFixed(2);
  }

  return {
    format,
    dimensions,
    weight,
    grammage
  };
};
