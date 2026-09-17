import z from "zod";
import i18n from "../i18n";

export const getAdminSchema = () =>
  z.object({
    userName: z.string().min(3, i18n.t("validation.admin.nameMin")),
    userWhatsAppNumber: z.string().min(5, i18n.t("validation.admin.whatsappInvalid")),
    userPassword: z.string().min(6, i18n.t("validation.admin.passwordMin")).optional(),
    userRole: z.string().min(2, i18n.t("validation.admin.roleRequired")),
  });

export type AdminForm = z.infer<ReturnType<typeof getAdminSchema>>;
