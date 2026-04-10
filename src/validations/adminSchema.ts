import z from "zod";

export const AdminSchema = z.object({
  userName: z.string().min(3, "Nama minimal 3 karakter"),
  userWhatsAppNumber: z.string().min(5, "Masukkan email yang valid"),
  userPassword: z.string().min(6, "Password minimal 6 karakter").optional(),
  userRole: z.string().min(2, "role harus dipilih"),
});

export type AdminForm = z.infer<typeof AdminSchema>;
