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
  const [openModal, setOpenModal] = useState(false);
  const [draftWhatsappNumber, setDraftWhatsappNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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

  const saveWhatsappNumber = async (number: string) => {
    try {
      const payload: ISettingCreateRequest = {
        whatsappNumber: number,
      };
      await handlePostRequest({
        path: "/settings",
        body: payload,
      });
      setWhatsappNumber(number);
      await getDetailSettings();
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
      setRequestingOtp(true);
      await handlePostRequest({
        path: "/otp/request",
        body: {
          whatsappNumber: sanitizedWhatsapp,
          otpType: "register",
        },
      });
      setOtpRequested(true);
      setSnackbarMessage("Kode OTP berhasil dikirim.");
      setOpenSnackbar(true);
    } catch (error) {
      console.log(error);
      setSnackbarMessage("Gagal mengirim OTP.");
      setOpenSnackbar(true);
    } finally {
      setRequestingOtp(false);
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
      setVerifyingOtp(true);
      await handlePostRequest({
        path: "/otp/verify",
        body: {
          whatsappNumber: sanitizedWhatsapp,
          otpCode: sanitizedOtp,
        },
      });
      await saveWhatsappNumber(sanitizedWhatsapp);
      setOpenModal(false);
      setOtpRequested(false);
      setOtpCode("");
    } catch (error) {
      console.log(error);
      setSnackbarMessage("OTP tidak valid atau verifikasi gagal.");
      setOpenSnackbar(true);
    } finally {
      setVerifyingOtp(false);
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
