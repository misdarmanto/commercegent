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
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import {
  useSettings,
  useSaveSettings,
  useRequestOtp,
  useVerifyOtp,
} from "../../services/settings";

export default function GeneralSettingsView() {
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { data: settings, isLoading: loading } = useSettings();
  const whatsappNumber = settings?.whatsappNumber || "";
  const saveSettings = useSaveSettings();
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();
  const requestingOtp = requestOtpMutation.isPending;
  const verifyingOtp = verifyOtpMutation.isPending;

  const [openModal, setOpenModal] = useState(false);
  const [draftWhatsappNumber, setDraftWhatsappNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const saveWhatsappNumber = async (number: string) => {
    try {
      await saveSettings.mutateAsync({ whatsappNumber: number });
      setSnackbarMessage("Berhasil disimpan!");
      setOpenSnackbar(true);
    } catch (error: unknown) {
      console.log(error);
      setSnackbarMessage("Terjadi kesalahan saat menyimpan data.");
      setOpenSnackbar(true);
    }
  };

  const openVerificationModal = () => {
    setDraftWhatsappNumber(whatsappNumber);
    setOtpCode("");
    setOtpRequested(false);
    setOpenModal(true);
  };

  const handleRequestOtp = async () => {
    const sanitizedWhatsapp = draftWhatsappNumber.trim();
    if (!sanitizedWhatsapp) {
      setSnackbarMessage("Nomor WhatsApp wajib diisi.");
      setOpenSnackbar(true);
      return;
    }
    try {
      await requestOtpMutation.mutateAsync({
        whatsappNumber: sanitizedWhatsapp,
        otpType: "register",
      });
      setOtpRequested(true);
      setSnackbarMessage("Kode OTP berhasil dikirim.");
      setOpenSnackbar(true);
    } catch (error) {
      console.log(error);
      setSnackbarMessage("Gagal mengirim OTP.");
      setOpenSnackbar(true);
    }
  };

  const handleVerifyOtp = async () => {
    const sanitizedWhatsapp = draftWhatsappNumber.trim();
    const sanitizedOtp = otpCode.trim();
    if (!sanitizedWhatsapp || !sanitizedOtp) {
      setSnackbarMessage("Nomor WhatsApp dan kode OTP wajib diisi.");
      setOpenSnackbar(true);
      return;
    }
    try {
      await verifyOtpMutation.mutateAsync({
        whatsappNumber: sanitizedWhatsapp,
        otpCode: sanitizedOtp,
      });
      await saveWhatsappNumber(sanitizedWhatsapp);
      setOpenModal(false);
      setOtpRequested(false);
      setOtpCode("");
    } catch (error) {
      console.log(error);
      setSnackbarMessage("OTP tidak valid atau verifikasi gagal.");
      setOpenSnackbar(true);
    }
  };

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
          <Grid item xs={12}>
            {!whatsappNumber ? (
              <Button variant="outlined" onClick={openVerificationModal}>
                Add WhatsApp Number
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body1">
                  Nomor WhatsApp: <strong>{whatsappNumber}</strong>
                </Typography>
                <Button variant="outlined" onClick={openVerificationModal}>
                  Edit
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      <Dialog
        open={openModal}
        onClose={() =>
          !requestingOtp &&
          !verifyingOtp &&
          (() => {
            setOpenModal(false);
            setOtpRequested(false);
            setOtpCode("");
          })()
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Verifikasi Nomor WhatsApp</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "grid", gap: 2 }}>
            <TextField
              label="Nomor WhatsApp"
              value={draftWhatsappNumber}
              onChange={(e) => setDraftWhatsappNumber(e.target.value ?? "")}
              fullWidth
              disabled={otpRequested}
            />
            {otpRequested && (
              <TextField
                label="Kode OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value ?? "")}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenModal(false);
              setOtpRequested(false);
              setOtpCode("");
            }}
            disabled={requestingOtp || verifyingOtp}
          >
            Batal
          </Button>
          {!otpRequested ? (
            <Button
              variant="contained"
              onClick={handleRequestOtp}
              disabled={requestingOtp}
            >
              {requestingOtp ? "Mengirim..." : "Kirim OTP"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              {verifyingOtp ? "Memverifikasi..." : "Verifikasi OTP"}
            </Button>
          )}
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
