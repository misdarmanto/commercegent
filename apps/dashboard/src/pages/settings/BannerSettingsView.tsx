import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import ButtonDeleteFile from "../../components/buttons/ButtonDeleteFile";
import ButtonUploadWithOption from "../../components/buttons/ButtonUploadWithOption";
import { IconMenus } from "../../components/icon";
import {
  useBanners,
  useCreateBanner,
  useRemoveBanner,
  type BannerItem,
} from "../../services/settings";
import { getImageUrl } from "../../utilities/getImageUrl";

export default function BannerSettingsView() {
  const { t } = useTranslation();
  const [bannerImage, setBannerImage] = useState("");
  const [bannerOrder, setBannerOrder] = useState<number>(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

  const { data: banners = [], isLoading: loadingBanners } = useBanners();
  const createBanner = useCreateBanner();
  const removeBanner = useRemoveBanner();
  const saving = createBanner.isPending;

  const handleSubmit = async () => {
    if (!bannerImage) {
      setSnackbarMessage(t("settings.bannerPanel.imageRequired"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      await createBanner.mutateAsync({
        bannerImage,
        bannerOrder: Number(bannerOrder),
      });

      setSnackbarMessage(t("settings.bannerPanel.savedSuccess"));
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setBannerImage("");
      setBannerOrder(1);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(t("settings.bannerPanel.errorSaving"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleOpenDeleteDialog = (banner: BannerItem) => {
    setSelectedBanner(banner);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;

    try {
      await removeBanner.mutateAsync(selectedBanner.bannerId);
      setSnackbarMessage(t("settings.bannerPanel.deletedSuccess"));
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      setSelectedBanner(null);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(t("settings.bannerPanel.errorDeleting"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("settings.title"),
            link: "/settings",
            icon: <IconMenus.settings fontSize="small" />,
          },
          { label: t("settings.banner"), link: "/settings?tab=banner" },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t("settings.bannerPanel.order")}
              type="number"
              fullWidth
              value={bannerOrder}
              onChange={(e) => setBannerOrder(Number(e.target.value || 1))}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 3 }}>
          <Typography color="text.secondary">
            {t("settings.bannerPanel.imageHint")}
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} mt={1}>
            {bannerImage ? (
              <Stack spacing={1}>
                <img
                  src={getImageUrl(bannerImage)}
                  alt="banner preview"
                  style={{
                    width: 300,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <ButtonDeleteFile
                  filename={bannerImage}
                  onDelete={() => setBannerImage("")}
                />
              </Stack>
            ) : (
              <Stack alignItems="center" justifyContent="center">
                <ButtonUploadWithOption
                  onUpload={(image) => setBannerImage(image)}
                />
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleSubmit} disabled={saving}>
            {saving ? t("settings.bannerPanel.saving") : t("settings.bannerPanel.save")}
          </Button>
        </Box>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t("settings.bannerPanel.savedList")}
        </Typography>

        {loadingBanners ? (
          <Typography color="text.secondary">{t("settings.bannerPanel.loadingBanners")}</Typography>
        ) : banners.length === 0 ? (
          <Typography color="text.secondary">{t("settings.bannerPanel.noBanners")}</Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" spacing={2}>
            {banners.map((banner) => (
              <Stack
                key={banner.bannerId}
                spacing={1}
                sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 1.5 }}
              >
                <img
                  src={getImageUrl(banner.bannerImage)}
                  alt={`banner-${banner.bannerId}`}
                  style={{
                    width: 260,
                    height: 130,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("settings.bannerPanel.idOrder", { id: banner.bannerId, order: banner.bannerOrder })}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleOpenDeleteDialog(banner)}
                >
                  {t("settings.bannerPanel.delete")}
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("settings.bannerPanel.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("settings.bannerPanel.confirmDeleteMessage", { id: selectedBanner?.bannerId ?? "-" })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t("settings.bannerPanel.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            {t("settings.bannerPanel.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
