import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLoginAdmin } from "../../services/auth";
import { useToken } from "../../hooks/token";
import { ILoginAdmin, getLoginAdminSchema } from "../../validations/AuthSchema";
import logo from "../../assets/logo.jpg";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function LoginView() {
  const { t } = useTranslation();
  const loginAdmin = useLoginAdmin();
  const { setToken } = useToken();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginAdmin>({
    resolver: zodResolver(getLoginAdminSchema()),
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
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <LanguageSwitcher />
      </Box>

      {/* ================= BRAND PANEL ================= */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
          maxWidth: 560,
          p: 6,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          background: (theme) =>
            `linear-gradient(160deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.dark} 130%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.5,
            background:
              "radial-gradient(600px 400px at 90% 0%, rgba(255,255,255,0.14), transparent 60%), radial-gradient(500px 500px at -10% 100%, rgba(255,255,255,0.12), transparent 55%)",
          }}
        />

        <Stack direction="row" alignItems="center" gap={1.5} sx={{ position: "relative" }}>
          <Box
            component="img"
            src={logo}
            alt={t("app.name")}
            sx={{ width: 44, height: 44, borderRadius: 2 }}
          />
          <Typography variant="h5" fontWeight={800} letterSpacing=".08em">
            {t("app.name")}
          </Typography>
        </Stack>

        <Box sx={{ position: "relative" }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2, maxWidth: 380 }}>
            {t("app.tagline")}
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 380 }}>
            {t("app.description")}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ position: "relative", opacity: 0.65 }}>
          {t("app.copyright", { year: new Date().getFullYear() })}
        </Typography>
      </Box>

      {/* ================= FORM PANEL ================= */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{ mb: 5, display: { xs: "flex", md: "none" } }}
          >
            <Box
              component="img"
              src={logo}
              alt={t("app.name")}
              sx={{ width: 40, height: 40, borderRadius: 2 }}
            />
            <Typography variant="h6" fontWeight={800} color="primary" letterSpacing=".08em">
              {t("app.name")}
            </Typography>
          </Stack>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              bgcolor: "primary.lighter",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
              mb: 3,
            }}
          >
            <LockOutlinedIcon />
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.75 }}>
            {t("auth.welcomeBack")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t("auth.loginSubtitle")}
          </Typography>

          {(errors.adminWhatsAppNumber || errors.adminPassword) && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {t("auth.formError")}
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "grid", gap: 2.5 }}
          >
            <TextField
              label={t("auth.whatsappNumber")}
              type="text"
              autoComplete="username"
              fullWidth
              autoFocus
              {...register("adminWhatsAppNumber")}
              error={!!errors.adminWhatsAppNumber}
              helperText={errors.adminWhatsAppNumber?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WhatsAppIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              {...register("adminPassword")}
              error={!!errors.adminPassword}
              helperText={errors.adminPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              sx={{ mt: 1, py: 1.4 }}
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1.5 }} />
                  {t("auth.submitting")}
                </>
              ) : (
                t("auth.submit")
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
