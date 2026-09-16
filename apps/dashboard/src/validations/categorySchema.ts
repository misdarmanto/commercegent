import { z } from "zod";
import i18n from "../i18n";

export const getCategorySchema = () =>
  z.object({
    categoryId: z.number().optional(),
    categoryName: z.string().min(3, i18n.t("validation.category.nameMin")),
    categoryIcon: z.string().optional(),
    categoryType: z.string().min(1, i18n.t("validation.category.typeRequired")),
  });

export type CategoryFormValues = z.infer<ReturnType<typeof getCategorySchema>>;

export const getSubCategorySchema = () =>
  z.object({
    categoryId: z.number().optional(),
    categoryReference: z.string().min(1, i18n.t("validation.category.parentRequired")),
    categoryName: z.string().min(3, i18n.t("validation.category.nameMin")),
    categoryType: z.string().min(1, i18n.t("validation.category.typeRequired")),
  });

export type SubCategoryFormValues = z.infer<ReturnType<typeof getSubCategorySchema>>;
