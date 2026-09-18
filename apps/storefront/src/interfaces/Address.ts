export interface IAddress {
  addressId: number;
  addressUserId: number;
  addressUserName: string;
  addressKontak: string;
  addressDetail: string;
  addressPostalCode: string;
  addressProvinsiId: string;
  addressProvinsiName: string;
  addressKabupatenId: string;
  addressKabupatenName: string;
  addressKecamatanId: string;
  addressKecamatanName: string;
  addressDesaId: string;
  addressDesaName: string;
  addressCategory: "user" | "admin";
  addressLatitude: string;
  addressLongitude: string;
  addressType: "main" | "secondary";
}

export interface ICreateAddressPayload {
  addressUserName: string;
  addressKontak: string;
  addressDetail: string;
  addressPostalCode: string;
  addressProvinsiId: string;
  addressProvinsiName: string;
  addressKabupatenId: string;
  addressKabupatenName: string;
  addressKecamatanId: string;
  addressKecamatanName: string;
  addressDesaId: string;
  addressDesaName: string;
  addressLongitude: string;
  addressLatitude: string;
}
