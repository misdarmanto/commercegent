"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { useLogin } from "@/lib/api/auth";

const loginSchema = z.object({
  userWhatsAppNumber: z.string().min(8, "Nomor WhatsApp tidak valid"),
  userPassword: z.string().min(1, "Password wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginForm) => {
    login.mutate(values, {
      onSuccess: () => {
        router.push("/");
        router.refresh();
      },
    });
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
          Masuk
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {login.isError && (
              <Alert severity="error">
                Nomor WhatsApp atau password salah.
              </Alert>
            )}

            <TextField
              label="Nomor WhatsApp"
              fullWidth
              {...register("userWhatsAppNumber")}
              error={!!errors.userWhatsAppNumber}
              helperText={errors.userWhatsAppNumber?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register("userPassword")}
              error={!!errors.userPassword}
              helperText={errors.userPassword?.message}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={login.isPending}
            >
              {login.isPending ? "Memproses..." : "Masuk"}
            </Button>

            <Typography variant="body2" align="center">
              Belum punya akun?{" "}
              <Link href="/register">Daftar</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
