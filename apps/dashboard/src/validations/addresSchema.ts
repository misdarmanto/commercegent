import z from "zod";
import i18n from "../i18n";

export const getAddressSchema = () =>
  z.object({
    addressUserName: z.string().min(1, i18n.t("validation.address.nameRequired")),
    addressKontak: z.string().min(1, i18n.t("validation.address.contactRequired")),
    addressDetail: z.string().min(1, i18n.t("validation.address.detailRequired")),
    addressPostalCode: z.string().min(3, i18n.t("validation.address.postalInvalid")),
    addressProvinsiId: z.string().min(1, i18n.t("validation.address.provinceRequired")),
    addressProvinsiName: z.string().min(1, i18n.t("validation.address.provinceRequired")),
    addressKabupatenId: z.string().min(1, i18n.t("validation.address.regencyRequired")),
    addressKabupatenName: z.string().min(1, i18n.t("validation.address.regencyRequired")),
    addressKecamatanId: z.string().min(1, i18n.t("validation.address.districtRequired")),
    addressKecamatanName: z.string().min(1, i18n.t("validation.address.districtRequired")),
    addressDesaId: z.string().min(1, i18n.t("validation.address.villageRequired")),
    addressDesaName: z.string().min(1, i18n.t("validation.address.villageRequired")),
    addressLatitude: z.string().min(1, i18n.t("validation.address.locationRequired")),
    addressLongitude: z.string().min(1, i18n.t("validation.address.locationRequired")),
  });

export type AddressFormType = z.infer<ReturnType<typeof getAddressSchema>>;
