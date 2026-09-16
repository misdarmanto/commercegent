import {
  Alert,
  Button,
  Card,
  Typography,
  Container,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginAdmin } from "../../services/auth";
import { useToken } from "../../hooks/token";
import { ILoginAdmin, loginAdminSchema } from "../../validations/AuthSchema";

export default function LoginView() {
  const loginAdmin = useLoginAdmin();
  const { setToken } = useToken();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginAdmin>({
    resolver: zodResolver(loginAdminSchema),
    defaultValues: {
      adminWhatsAppNumber: "",
      adminPassword: "",
    },
  });

  const onSubmit = async (formData: ILoginAdmin) => {
    try {
      const result = await loginAdmin.mutateAsync(formData);

      if (result !== null) {
        setToken(result.token);
        navigate("/");
        window.location.reload();
      }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "grey.100",
        py: 3,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow: 6,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "grid",
                placeItems: "center",
                color: "white",
              }}
            >
              <IconMenus.profile />
            </Box>
          </Box>

          <Typography
            variant="h5"
            textAlign="center"
            color="primary"
            fontWeight="bold"
          >
            Admin Login
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 3 }}
          >
            Masuk menggunakan nomor WhatsApp dan password
          </Typography>

          {(errors.adminWhatsAppNumber || errors.adminPassword) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Periksa kembali form login Anda.
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="WhatsApp"
              size="small"
              type="text"
              autoComplete="username"
              fullWidth
              {...register("adminWhatsAppNumber")}
              error={!!errors.adminWhatsAppNumber}
              helperText={errors.adminWhatsAppNumber?.message}
            />

            <TextField
              label="Password"
              size="small"
              type="password"
              autoComplete="current-password"
              fullWidth
              {...register("adminPassword")}
              error={!!errors.adminPassword}
              helperText={errors.adminPassword?.message}
            />

            <Button
              sx={{ width: "100%", fontWeight: "bold", py: 1 }}
              variant="contained"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                  Memproses...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
