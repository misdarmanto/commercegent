import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import {
  useAdmin,
  useCreateAdmin,
  useUpdateAdmin,
} from "../../services/admins";
import { AdminForm, getAdminSchema } from "../../validations/adminSchema";

export default function FormAdminView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: admin } = useAdmin(id);
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdminForm>({
    resolver: zodResolver(getAdminSchema()),
    defaultValues: {
      userRole: "",
    },
  });

  useEffect(() => {
    if (admin) {
      reset({
        userName: admin.userName,
        userWhatsAppNumber: admin.userWhatsAppNumber,
        userRole: admin.userRole,
      });
    }
  }, [admin, reset]);

  const onSubmit = async (formData: AdminForm) => {
    try {
      if (id) {
        await updateAdmin.mutateAsync({ id, formData });
      } else {
        await createAdmin.mutateAsync(formData);
      }
      navigate("/admins");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("admin.title"),
            link: "/admins",
            icon: <IconMenus.admin fontSize="small" />,
          },
          {
            label: id ? t("admin.form.update") : t("common.add"),
            link: id ? `/admins/update/${id}` : "/admins/create",
          },
        ]}
      />
      <Card
        sx={{
          mt: 5,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h4"
          mb={4}
          color="primary"
          fontWeight="bold"
          textAlign="center"
        >
          {id ? t("admin.form.editTitle") : t("admin.form.createTitle")}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("admin.form.name")}
                fullWidth
                {...register("userName")}
                error={!!errors.userName}
                helperText={errors.userName?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={t("admin.form.whatsapp")}
                fullWidth
                {...register("userWhatsAppNumber")}
                error={!!errors.userWhatsAppNumber}
                helperText={errors.userWhatsAppNumber?.message}
              />
            </Grid>

            {!id && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("admin.form.password")}
                  type="password"
                  fullWidth
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "off",
                  }}
                  {...register("userPassword")}
                  error={!!errors.userPassword}
                  helperText={errors.userPassword?.message}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.userRole}>
                <InputLabel id="role-label">{t("admin.form.selectRole")}</InputLabel>

                <Controller
                  name="userRole"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId="role-label" label={t("admin.form.selectRole")}>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="superAdmin">Super Admin</MenuItem>
                    </Select>
                  )}
                />

                {errors.userRole && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {errors.userRole.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admins")}
            >
              {t("admin.form.cancel")}
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{
                px: 4,
                py: 1,
                fontWeight: "bold",
                borderRadius: 3,
              }}
            >
              {id ? t("admin.form.update") : t("admin.form.submit")}
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
