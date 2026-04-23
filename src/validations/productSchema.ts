import { z } from "zod";

/** Satu baris varian di form (create + update) */
const productVariantRowSchema = z.object({
  productVariantId: z.number().optional(),
  productVariantName: z.string().min(1, "Nama varian wajib diisi"),
  productVariantImage: z.string().optional(),
  productVariantPrice: z.coerce.number().min(0, "Harga >= 0"),
  productVariantStock: z.coerce.number().min(0, "Stok >= 0"),
  productVariantDiscount: z.coerce.number().min(0).max(100, "Diskon 0–100"),
  productVariantWeight: z.coerce.number().min(0, "Berat >= 0").optional(),
});

const productBaseSchema = z.object({
  productName: z.string().min(3, "Nama produk minimal 3 karakter"),
  productDescription: z.string().optional().default(""),
  productCategoryId: z.coerce.number().refine((v) => v > 0, "Pilih kategori"),
  productSubCategoryId: z.coerce
    .number()
    .refine((v) => v > 0, "Pilih subkategori"),
  productCode: z.string().min(1, "Kode produk wajib diisi"),
  productBarcode: z.string().min(1, "Barcode wajib diisi"),
  productUnit: z.string().min(1, "Satuan wajib diisi"),
  productIsVisible: z.boolean().optional().default(true),
  productVariants: z
    .array(productVariantRowSchema)
    .min(1, "Minimal satu varian produk"),
});

/** Create: setiap varian wajib lengkap (sesuai contoh API) */
export const productFormCreateSchema = productBaseSchema.superRefine(
  (data, ctx) => {
    data.productVariants.forEach((v, i) => {
      if (!v.productVariantImage?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gambar varian wajib diisi",
          path: ["productVariants", i, "productVariantImage"],
        });
      }
      if (
        v.productVariantWeight == null ||
        Number.isNaN(v.productVariantWeight)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Berat wajib diisi",
          path: ["productVariants", i, "productVariantWeight"],
        });
      }
    });
  },
);

/** Update: lebih longgar; varian existing boleh partial */
export const productFormUpdateSchema = productBaseSchema.superRefine(
  (data, ctx) => {
    data.productVariants.forEach((v, i) => {
      const isNew = v.productVariantId == null;
      if (isNew) {
        if (!v.productVariantImage?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Gambar varian wajib untuk varian baru",
            path: ["productVariants", i, "productVariantImage"],
          });
        }
        if (
          v.productVariantWeight == null ||
          Number.isNaN(v.productVariantWeight)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Berat wajib untuk varian baru",
            path: ["productVariants", i, "productVariantWeight"],
          });
        }
      }
    });
  },
);

export type ProductFormValues = z.infer<typeof productBaseSchema>;
