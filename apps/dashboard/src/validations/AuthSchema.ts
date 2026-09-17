import { z } from "zod";
import i18n from "../i18n";

export const getLoginAdminSchema = () =>
  z.object({
    adminWhatsAppNumber: z
      .string()
      .min(1, i18n.t("validation.auth.whatsappRequired"))
      .min(5, i18n.t("validation.auth.whatsappMin")),
    adminPassword: z
      .string()
      .min(1, i18n.t("validation.auth.passwordRequired"))
      .min(6, i18n.t("validation.auth.passwordMin")),
  });

export type ILoginAdmin = z.infer<ReturnType<typeof getLoginAdminSchema>>;
