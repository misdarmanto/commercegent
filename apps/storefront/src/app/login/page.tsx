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
import { useTranslation } from "react-i18next";
import { useLogin } from "@/lib/api/auth";

const buildLoginSchema = (t: (key: string) => string) =>
  z.object({
    userWhatsAppNumber: z.string().min(8, t("auth.whatsappNumberInvalid")),
    userPassword: z.string().min(1, t("auth.passwordRequired")),
  });

type LoginForm = z.infer<ReturnType<typeof buildLoginSchema>>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(buildLoginSchema(t)) });

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
          {t("auth.loginTitle")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {login.isError && (
              <Alert severity="error">{t("auth.loginError")}</Alert>
            )}

            <TextField
              label={t("auth.whatsappNumber")}
              fullWidth
              {...register("userWhatsAppNumber")}
              error={!!errors.userWhatsAppNumber}
              helperText={errors.userWhatsAppNumber?.message}
            />

            <TextField
              label={t("auth.password")}
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
              {login.isPending ? t("auth.submitting") : t("auth.signIn")}
            </Button>

            <Typography variant="body2" align="center">
              {t("auth.noAccount")}{" "}
              <Link href="/register">{t("auth.register")}</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
