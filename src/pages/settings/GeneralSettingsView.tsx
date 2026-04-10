import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { ISettingModel } from "../../models/settingMode";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import ButtonDeleteFile from "../../components/buttons/ButtonDeleteFile";
import ButtonUploadWithOption from "../../components/buttons/ButtonUploadWithOption";

export default function GeneralSettingsView() {
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDeleteImage = (oldImage: string) => {
    const newImages = bannerImages.filter((image) => image !== oldImage);
    setBannerImages(newImages);
  };

  const getDetailSettings = async () => {
    try {
      const result: ISettingModel = await handleGetRequest({
        path: "/settings?settingType=general",
      });

      if (result && Array.isArray(result)) {
        const images = result[0].banner || [];
        const whatsapp = result[0].whatsappNumber || "";

        setBannerImages(images);
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
      const payload: ISettingModel = {
        settingType: "general",
        whatsappNumber: whatsappNumber,
        banner: bannerImages || [],
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
        <Box sx={{ my: 3 }}>
          <Typography color={"gray"}>
            Banner: 1080×540 px (rasio 2:1), maks 2mb
          </Typography>

          <Stack direction={"row"} flexWrap="wrap" spacing={2}>
            {Array.isArray(bannerImages) &&
              bannerImages.map((image, index) => (
                <Stack key={index} spacing={1}>
                  <img
                    src={getImageUrl(image)}
                    style={{
                      marginTop: 10,
                      width: 200,
                      height: 200,
                    }}
                  />
                  <ButtonDeleteFile
                    filename={image}
                    onDelete={() => handleDeleteImage(image)}
                  />
                </Stack>
              ))}
            <Stack alignItems="center" justifyContent={"center"} mt={2}>
              <ButtonUploadWithOption
                onUpload={(image) => setBannerImages([...bannerImages, image])}
              />
            </Stack>
          </Stack>
        </Box>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          sx={{ marginTop: 5 }}
        >
          <Button variant="outlined" onClick={handleSubmit}>
            Simpan
          </Button>
        </Stack>
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
