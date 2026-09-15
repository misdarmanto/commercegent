export interface IAddress {
  addressId?: number;
  addressUserId?: number;
  addressUserName: string;
  addressKontak: string;
  addressDetail: string;
  addressPostalCode: string;
  addressCategory?: "user" | "admin";
  addressLatitude: string;
  addressLongitude: string;
  /** Wilayah (API terbaru) */
  addressProvinsiId?: string;
  addressProvinsiName?: string;
  addressKabupatenId?: string;
  addressKabupatenName?: string;
  addressKecamatanId?: string;
  addressKecamatanName?: string;
  addressDesaId?: string;
  addressDesaName?: string;
  /** Legacy nama saja (fallback) */
  addressProvinsi?: string;
  addressKabupaten?: string;
  addressKecamatan?: string;
  addressDesa?: string;
}
