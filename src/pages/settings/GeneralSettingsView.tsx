import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { ISetting, ISettingCreateRequest } from "../../interfaces/Setting";

export default function GeneralSettingsView() {
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  const getDetailSettings = async () => {
    try {
      const result: ISetting = await handleGetRequest({
        path: "/settings",
      });

      if (result) {
        const whatsapp = result.whatsappNumber || "";
        setWhatsappNumber(whatsapp);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: ISettingCreateRequest = {
        whatsappNumber: whatsappNumber ?? "",
      };
      await handlePostRequest({
        path: "/settings",
        body: payload,
      });
      await getDetailSettings();
      setSnackbarMessage("Berhasil disimpan!");
      setOpenSnackbar(true);
    } catch (error: unknown) {
      console.log(error);
      setSnackbarMessage("Terjadi kesalahan saat menyimpan data.");
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    getDetailSettings();
  }, []);

  if (loading) return "loading...";

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Settings",
            link: "/settings",
            icon: <IconMenus.settings fontSize="small" />,
          },
          {
            label: "General",
            link: "/settings",
          },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nomor WA"
              id="outlined-start-adornment"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value ?? "")}
              type="text"
              fullWidth
            />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
          <Button variant="outlined" onClick={handleSubmit}>
            Simpan
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarMessage.includes("kesalahan") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
