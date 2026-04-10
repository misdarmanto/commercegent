import {
  Button,
  Card,
  Typography,
  Container,
  Box,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHttp } from "../../hooks/http";
import { useToken } from "../../hooks/token";
import { ILoginAdmin, loginAdminSchema } from "../../validations/AuthSchema";

export default function LoginView() {
  const { handlePostRequest } = useHttp();
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
      const result = await handlePostRequest({
        path: "/auth/admin/login",
        body: formData,
      });

      console.log("result", result);

      if (result !== null) {
        setToken(result.data.token);
        navigate("/");
        window.location.reload();
      }
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <>
      <Container maxWidth="xs">
        <Card
          sx={{
            mt: 5,
            p: 8,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h4"
            marginBottom={5}
            color="primary"
            textAlign={"center"}
            fontWeight={"bold"}
          >
            Login
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <TextField
              label="Whatsapp"
              id="outlined-start-adornment"
              sx={{ m: 1, width: "100%" }}
              size="small"
              type="text"
              autoComplete="username"
              {...register("adminWhatsAppNumber")}
              error={!!errors.adminWhatsAppNumber}
              helperText={errors.adminWhatsAppNumber?.message}
            />

            <TextField
              label="Password"
              id="outlined-start-adornment"
              sx={{ m: 1, width: "100%" }}
              size="small"
              type="password"
              autoComplete="current-password"
              {...register("adminPassword")}
              error={!!errors.adminPassword}
              helperText={errors.adminPassword?.message}
            />
            <Button
              sx={{
                m: 1,
                width: "100%",
                fontWeight: "bold",
              }}
              variant={"contained"}
              type="submit"
              disabled={isSubmitting}
            >
              Login
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  );
}
