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
import { useLogin, useRegister } from "@/lib/api/auth";

const registerSchema = z.object({
  userName: z.string().min(1, "Nama wajib diisi"),
  userWhatsAppNumber: z.string().min(8, "Nomor WhatsApp tidak valid"),
  userPassword: z.string().min(6, "Password minimal 6 karakter"),
  userGender: z.enum(["pria", "wanita"], { message: "Pilih jenis kelamin" }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useRegister();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
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
          Daftar Akun
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {hasError && (
              <Alert severity="error">
                Gagal mendaftar. Nomor WhatsApp mungkin sudah terdaftar.
              </Alert>
            )}

            <TextField
              label="Nama Lengkap"
              fullWidth
              {...register("userName")}
              error={!!errors.userName}
              helperText={errors.userName?.message}
            />

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

            <FormControl>
              <FormLabel>Jenis Kelamin</FormLabel>
              <Controller
                name="userGender"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="pria" control={<Radio />} label="Pria" />
                    <FormControlLabel value="wanita" control={<Radio />} label="Wanita" />
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
              {isSubmitting ? "Memproses..." : "Daftar"}
            </Button>

            <Typography variant="body2" align="center">
              Sudah punya akun? <Link href="/login">Masuk</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
