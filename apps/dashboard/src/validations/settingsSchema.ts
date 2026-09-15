import z from "zod";

export const WaBlasSchema = z.object({
  waBlasToken: z.string().min(1, "Token wajib diisi"),
  waBlasServer: z.string().url("Masukkan URL server yang valid"),
});

export type WaBlasFormType = z.infer<typeof WaBlasSchema>;

export const LocalShippingSchema = z.object({
  localShippingCompanyName: z.string().min(1, "Nama wajib diisi"),
  localShippingProvinceName: z.string().min(1, "Provinsi wajib diisi"),
  localShippingProvinceId: z.string().min(1, "Provinsi wajib dipilih"),
  localShippingKabupatenName: z.string().min(1, "Kabupaten/Kota wajib diisi"),
  localShippingKabupatenId: z.string().min(1, "Kabupaten/Kota wajib dipilih"),
  localShippingPricePerKg: z.coerce
    .number()
    .min(0, "Harga per kg harus 0 atau lebih"),
  localShippingDuration: z.string().min(1, "Durasi wajib diisi"),
});

export type LocalShippingFormInputType = z.input<typeof LocalShippingSchema>;
export type LocalShippingFormType = z.infer<typeof LocalShippingSchema>;
