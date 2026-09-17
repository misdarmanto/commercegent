"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useTranslation } from "react-i18next";
import { useLogin, useRegister } from "@/lib/api/auth";

const buildRegisterSchema = (t: (key: string) => string) =>
  z.object({
    userName: z.string().min(1, t("auth.fullNameRequired")),
    userWhatsAppNumber: z.string().min(8, t("auth.whatsappNumberInvalid")),
    userPassword: z.string().min(6, t("auth.passwordMinLength")),
    userGender: z.enum(["pria", "wanita"], { message: t("auth.genderRequired") }),
  });

type RegisterForm = z.infer<ReturnType<typeof buildRegisterSchema>>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const registerUser = useRegister();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(buildRegisterSchema(t)),
    defaultValues: { userGender: "pria" },
  });

  const onSubmit = (values: RegisterForm) => {
    registerUser.mutate(values, {
      onSuccess: () => {
        login.mutate(
          {
            userWhatsAppNumber: values.userWhatsAppNumber,
            userPassword: values.userPassword,
          },
          {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        );
      },
    });
  };

  const isSubmitting = registerUser.isPending || login.isPending;
  const hasError = registerUser.isError || login.isError;

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
          {t("auth.registerTitle")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {hasError && <Alert severity="error">{t("auth.registerError")}</Alert>}

            <TextField
              label={t("auth.fullName")}
              fullWidth
              {...register("userName")}
              error={!!errors.userName}
              helperText={errors.userName?.message}
            />

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

            <FormControl>
              <FormLabel>{t("auth.gender")}</FormLabel>
              <Controller
                name="userGender"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="pria"
                      control={<Radio />}
                      label={t("auth.male")}
                    />
                    <FormControlLabel
                      value="wanita"
                      control={<Radio />}
                      label={t("auth.female")}
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("auth.submitting") : t("auth.signUp")}
            </Button>

            <Typography variant="body2" align="center">
              {t("auth.haveAccount")} <Link href="/login">{t("auth.signIn")}</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
