export enum VoucherFormat {
  PNG = "PNG",
  PDF = "PDF",
}

export enum VoucherLayout {
  FrankingZone = "FrankingZone",
  AddressZone = "AddressZone",
}

export interface Voucher {
  voucherId: string;
  trackId?: string;
}
