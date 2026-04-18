import z from "zod";

export const AddressSchema = z.object({
  addressUserName: z.string().min(1, "Nama wajib diisi"),
  addressKontak: z.string().min(1, "Kontak wajib diisi"),
  addressDetail: z.string().min(1, "Detail alamat wajib diisi"),
  addressPostalCode: z.string().min(3, "Kode Pos tidak valid"),
  addressProvinsiId: z.string().min(1, "Provinsi wajib diisi"),
  addressProvinsiName: z.string().min(1, "Provinsi wajib diisi"),
  addressKabupatenId: z.string().min(1, "Kabupaten wajib diisi"),
  addressKabupatenName: z.string().min(1, "Kabupaten wajib diisi"),
  addressKecamatanId: z.string().min(1, "Kecamatan wajib diisi"),
  addressKecamatanName: z.string().min(1, "Kecamatan wajib diisi"),
  addressDesaId: z.string().min(1, "Desa wajib diisi"),
  addressDesaName: z.string().min(1, "Desa wajib diisi"),
  addressLatitude: z.string().min(1, "Lokasi belum dipilih"),
  addressLongitude: z.string().min(1, "Lokasi belum dipilih"),
});

export type AddressFormType = z.infer<typeof AddressSchema>;
