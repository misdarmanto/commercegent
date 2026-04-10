import { z } from "zod";

export const loginAdminSchema = z.object({
  adminWhatsAppNumber: z
    .string()
    .min(1, "Whatsapp wajib diisi")
    .min(5, "Whatsapp minimal 5 karakter"),
  adminPassword: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

export type ILoginAdmin = z.infer<typeof loginAdminSchema>;
