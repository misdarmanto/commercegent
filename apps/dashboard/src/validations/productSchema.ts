import { z } from "zod";
import i18n from "../i18n";

/** Satu baris varian di form (create + update) */
const getProductVariantRowSchema = () =>
  z.object({
    productVariantId: z.number().optional(),
    productVariantName: z.string().min(1, i18n.t("validation.product.variantNameRequired")),
    productVariantImage: z.string().optional(),
    productVariantPrice: z.coerce.number().min(0, i18n.t("validation.product.priceMin")),
    productVariantStock: z.coerce.number().min(0, i18n.t("validation.product.stockMin")),
    productVariantDiscount: z.coerce
      .number()
      .min(0)
      .max(100, i18n.t("validation.product.discountRange")),
    productVariantWeight: z.coerce
      .number()
      .min(0, i18n.t("validation.product.weightMin"))
      .optional(),
  });

const getProductBaseSchema = () =>
  z.object({
    productName: z.string().min(3, i18n.t("validation.product.nameMin")),
    productDescription: z.string().optional().default(""),
    productCategoryId: z.coerce
      .number()
      .refine((v) => v > 0, i18n.t("validation.product.categoryRequired")),
    productSubCategoryId: z.coerce
      .number()
      .refine((v) => v > 0, i18n.t("validation.product.subCategoryRequired")),
    productCode: z.string().min(1, i18n.t("validation.product.codeRequired")),
    productBarcode: z.string().min(1, i18n.t("validation.product.barcodeRequired")),
    productUnit: z.string().min(1, i18n.t("validation.product.unitRequired")),
    productIsVisible: z.boolean().optional().default(true),
    productVariants: z
      .array(getProductVariantRowSchema())
      .min(1, i18n.t("validation.product.variantsMin")),
  });

/** Create: setiap varian wajib lengkap (sesuai contoh API) */
export const getProductFormCreateSchema = () =>
  getProductBaseSchema().superRefine((data, ctx) => {
    data.productVariants.forEach((v, i) => {
      if (!v.productVariantImage?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t("validation.product.variantImageRequired"),
          path: ["productVariants", i, "productVariantImage"],
        });
      }
      if (
        v.productVariantWeight == null ||
        Number.isNaN(v.productVariantWeight)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.t("validation.product.variantWeightRequired"),
          path: ["productVariants", i, "productVariantWeight"],
        });
      }
    });
  });

/** Update: lebih longgar; varian existing boleh partial */
export const getProductFormUpdateSchema = () =>
  getProductBaseSchema().superRefine((data, ctx) => {
    data.productVariants.forEach((v, i) => {
      const isNew = v.productVariantId == null;
      if (isNew) {
        if (!v.productVariantImage?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t("validation.product.variantImageRequiredNew"),
            path: ["productVariants", i, "productVariantImage"],
          });
        }
        if (
          v.productVariantWeight == null ||
          Number.isNaN(v.productVariantWeight)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t("validation.product.variantWeightRequiredNew"),
            path: ["productVariants", i, "productVariantWeight"],
          });
        }
      }
    });
  });

export type ProductFormValues = z.infer<ReturnType<typeof getProductBaseSchema>>;
