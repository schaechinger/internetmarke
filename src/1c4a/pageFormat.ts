export enum PageFormatPageType {
  RegularPage = 'REGULARPAGE',
  Envelope = 'ENVELOPE',
  LabelPrinter = 'LABELPRINTER',
  LabelPage = 'LABELPAGE'
}

export enum PageFormatOrientation {
  Portrait = 'PORTRAIT',
  Landscape = 'LANDSCAPE'
}

export interface PageFormatDimension {
  x: number;
  y: number;
}

export interface PageFormatPosition {
  labelX: number;
  labelY: number;
  page?: number;
}

export interface PageFormatBorderDimension {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageFormat {
  id: number;
  name: string;
  isAddressPossible: boolean;
  isImagePossible: boolean;
  description?: string;
  pageType: PageFormatPageType;
  pageLayout: {
    size: PageFormatDimension;
    orientation: PageFormatOrientation;
    labelSpacing: PageFormatDimension;
    labelCount: PageFormatPosition;
    margin: PageFormatBorderDimension;
  };
}
