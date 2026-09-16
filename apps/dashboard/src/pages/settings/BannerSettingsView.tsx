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
  const [bannerImage, setBannerImage] = useState("");
  const [bannerOrder, setBannerOrder] = useState<number>(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);

  const { data: banners = [], isLoading: loadingBanners } = useBanners();
  const createBanner = useCreateBanner();
  const removeBanner = useRemoveBanner();
  const saving = createBanner.isPending;

  const handleSubmit = async () => {
    if (!bannerImage) {
      setSnackbarMessage("Banner image wajib diisi.");
      setOpenSnackbar(true);
      return;
    }

    try {
      await createBanner.mutateAsync({
        bannerImage,
        bannerOrder: Number(bannerOrder),
      });

      setSnackbarMessage("Banner berhasil disimpan.");
      setOpenSnackbar(true);
      setBannerImage("");
      setBannerOrder(1);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Terjadi kesalahan saat menyimpan banner.");
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
      setSnackbarMessage("Banner berhasil dihapus.");
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      setSelectedBanner(null);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Terjadi kesalahan saat menghapus banner.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Settings",
            link: "/settings",
            icon: <IconMenus.settings fontSize="small" />,
          },
          { label: "Banner", link: "/settings?tab=banner" },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Urutan Banner"
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
            Banner: 1080x540 px (rasio 2:1), maks 2MB
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
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </Box>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Daftar Banner Tersimpan
        </Typography>

        {loadingBanners ? (
          <Typography color="text.secondary">Memuat banner...</Typography>
        ) : banners.length === 0 ? (
          <Typography color="text.secondary">Belum ada banner.</Typography>
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
                  ID: {banner.bannerId} | Order: {banner.bannerOrder}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleOpenDeleteDialog(banner)}
                >
                  Delete
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
        <DialogTitle>Konfirmasi Hapus Banner</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah anda yakin ingin menghapus banner ID{" "}
            {selectedBanner?.bannerId ?? "-"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Hapus
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
          severity={snackbarMessage.includes("kesalahan") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
