"use client";

import { useEffect, useState } from "react";
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
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { useTranslation } from "react-i18next";
import { useProfile, useUpdateProfile } from "@/lib/api/profile";
import { isLoggedIn, removeToken } from "@/lib/auth/token";

const buildProfileSchema = (t: (key: string) => string) =>
  z.object({
    userName: z.string().min(1, t("auth.fullNameRequired")),
    userPassword: z
      .union([z.string().min(6, t("auth.passwordMinLength")), z.literal("")])
      .optional(),
  });

type ProfileForm = z.infer<ReturnType<typeof buildProfileSchema>>;

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(buildProfileSchema(t)),
    defaultValues: { userName: "", userPassword: "" },
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  useEffect(() => {
    if (profile) {
      reset({ userName: profile.userName, userPassword: "" });
    }
  }, [profile, reset]);

  const onSubmit = (values: ProfileForm) => {
    updateProfile.mutate(
      {
        userName: values.userName,
        userPassword: values.userPassword ? values.userPassword : undefined,
      },
      {
        onSuccess: () => {
          reset({ userName: values.userName, userPassword: "" });
        },
      },
    );
  };

  const handleLogout = () => {
    removeToken();
    router.push("/");
    router.refresh();
  };

  if (!checkedAuth || isLoading || !profile) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t("profile.title")}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            <PersonOutlineIcon />
          </Avatar>
          <Stack sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{profile.userName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.userWhatsAppNumber}
            </Typography>
          </Stack>
          <Chip label={t(`profile.role.${profile.userRole}`)} size="small" />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={4}>
          <Stack>
            <Typography variant="body2" color="text.secondary">
              {t("profile.coinPoints")}
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{profile.userCoin}</Typography>
          </Stack>
          {profile.userPartnerCode && (
            <Stack>
              <Typography variant="body2" color="text.secondary">
                {t("profile.partnerCode")}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {profile.userPartnerCode}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
          {t("profile.editProfile")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {updateProfile.isError && (
              <Alert severity="error">{t("profile.updateError")}</Alert>
            )}
            {updateProfile.isSuccess && (
              <Alert severity="success">{t("profile.updateSuccess")}</Alert>
            )}

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
              value={profile.userWhatsAppNumber}
              disabled
              helperText={t("profile.whatsappNumberHelper")}
            />

            <TextField
              label={t("profile.newPassword")}
              type="password"
              fullWidth
              placeholder={t("profile.newPasswordPlaceholder")}
              {...register("userPassword")}
              error={!!errors.userPassword}
              helperText={errors.userPassword?.message}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!isDirty || updateProfile.isPending}
            >
              {updateProfile.isPending ? t("profile.saving") : t("profile.saveChanges")}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack
          component={Link}
          href="/orders"
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            p: 1.5,
            borderRadius: 1,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ReceiptLongOutlinedIcon fontSize="small" />
          <Typography sx={{ flexGrow: 1 }}>{t("profile.myOrders")}</Typography>
        </Stack>

        <Divider />

        <Stack
          component={Link}
          href="/addresses"
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            p: 1.5,
            borderRadius: 1,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <LocationOnOutlinedIcon fontSize="small" />
          <Typography sx={{ flexGrow: 1 }}>{t("profile.myAddresses")}</Typography>
        </Stack>

        <Divider />

        <Stack
          direction="row"
          spacing={1.5}
          onClick={handleLogout}
          sx={{
            alignItems: "center",
            p: 1.5,
            borderRadius: 1,
            color: "error.main",
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <LogoutIcon fontSize="small" />
          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>{t("profile.logout")}</Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
