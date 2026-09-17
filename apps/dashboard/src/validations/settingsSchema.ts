import z from "zod";
import i18n from "../i18n";

export const getWaBlasSchema = () =>
  z.object({
    waBlasToken: z.string().min(1, i18n.t("validation.settings.tokenRequired")),
    waBlasServer: z.string().url(i18n.t("validation.settings.urlInvalid")),
  });

export type WaBlasFormType = z.infer<ReturnType<typeof getWaBlasSchema>>;

export const getLocalShippingSchema = () =>
  z.object({
    localShippingCompanyName: z.string().min(1, i18n.t("validation.settings.nameRequired")),
    localShippingProvinceName: z.string().min(1, i18n.t("validation.settings.provinceRequired")),
    localShippingProvinceId: z.string().min(1, i18n.t("validation.settings.provinceSelectRequired")),
    localShippingKabupatenName: z.string().min(1, i18n.t("validation.settings.regencyRequired")),
    localShippingKabupatenId: z.string().min(1, i18n.t("validation.settings.regencySelectRequired")),
    localShippingPricePerKg: z.coerce
      .number()
      .min(0, i18n.t("validation.settings.pricePerKgMin")),
    localShippingDuration: z.string().min(1, i18n.t("validation.settings.durationRequired")),
  });

export type LocalShippingFormInputType = z.input<ReturnType<typeof getLocalShippingSchema>>;
export type LocalShippingFormType = z.infer<ReturnType<typeof getLocalShippingSchema>>;
