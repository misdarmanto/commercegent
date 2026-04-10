import { useEffect } from "react";
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
import { useHttp } from "../../hooks/http";
import { AdminForm, AdminSchema } from "../../validations/adminSchema";

export default function FormAdminView() {
  const { handlePostRequest, handleGetRequest, handleUpdateRequest } =
    useHttp();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdminForm>({
    resolver: zodResolver(AdminSchema),
    defaultValues: {
      userRole: "",
    },
  });

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await handleGetRequest({ path: `/admins/detail/${id}` });
        reset({
          userName: data.userName,
          userWhatsAppNumber: data.userWhatsAppNumber,
          userRole: data.userRole,
        });
      })();
    }
  }, [id, reset]);

  const onSubmit = async (formData: AdminForm) => {
    try {
      if (id) {
        await handleUpdateRequest({
          path: `/admins`,
          body: { ...formData, productId: id },
        });
      } else {
        await handlePostRequest({
          path: "/admins/register",
          body: formData,
        });
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
            label: "Admin",
            link: "/admins",
            icon: <IconMenus.admin fontSize="small" />,
          },
          {
            label: id ? "Update" : "Create",
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
          {id ? "Edit Admin" : "Tambah Admin"}
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
                label="Nama"
                fullWidth
                {...register("userName")}
                error={!!errors.userName}
                helperText={errors.userName?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Whatsapp"
                fullWidth
                {...register("userWhatsAppNumber")}
                error={!!errors.userWhatsAppNumber}
                helperText={errors.userWhatsAppNumber?.message}
              />
            </Grid>

            {!id && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
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
                <InputLabel id="role-label">Pilih Role</InputLabel>

                <Controller
                  name="userRole"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} labelId="role-label" label="Pilih Role">
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
              Batal
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
              {id ? "Update" : "Submit"}
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
