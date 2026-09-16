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
import { useTranslation } from "react-i18next";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import {
  useSettings,
  useSaveSettings,
  useRequestOtp,
  useVerifyOtp,
} from "../../services/settings";

export default function GeneralSettingsView() {
  const { t } = useTranslation();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const notify = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

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
      notify(t("settings.generalPanel.savedSuccess"), "success");
    } catch (error: unknown) {
      console.log(error);
      notify(t("settings.generalPanel.errorSaving"), "error");
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
      notify(t("settings.generalPanel.whatsappRequiredAlert"), "error");
      return;
    }
    try {
      await requestOtpMutation.mutateAsync({
        whatsappNumber: sanitizedWhatsapp,
        otpType: "register",
      });
      setOtpRequested(true);
      notify(t("settings.generalPanel.otpSent"), "success");
    } catch (error) {
      console.log(error);
      notify(t("settings.generalPanel.otpSendFailed"), "error");
    }
  };

  const handleVerifyOtp = async () => {
    const sanitizedWhatsapp = draftWhatsappNumber.trim();
    const sanitizedOtp = otpCode.trim();
    if (!sanitizedWhatsapp || !sanitizedOtp) {
      notify(t("settings.generalPanel.whatsappAndOtpRequired"), "error");
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
      notify(t("settings.generalPanel.otpInvalid"), "error");
    }
  };

  if (loading) return t("settings.generalPanel.loading");

  return (
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("settings.title"),
            link: "/settings",
            icon: <IconMenus.settings fontSize="small" />,
          },
          {
            label: t("settings.general"),
            link: "/settings",
          },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {!whatsappNumber ? (
              <Button variant="outlined" onClick={openVerificationModal}>
                {t("settings.generalPanel.addWhatsapp")}
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
                  {t("settings.generalPanel.whatsappLabel")}: <strong>{whatsappNumber}</strong>
                </Typography>
                <Button variant="outlined" onClick={openVerificationModal}>
                  {t("settings.generalPanel.edit")}
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
        <DialogTitle>{t("settings.generalPanel.verifyTitle")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "grid", gap: 2 }}>
            <TextField
              label={t("settings.generalPanel.whatsappLabel")}
              value={draftWhatsappNumber}
              onChange={(e) => setDraftWhatsappNumber(e.target.value ?? "")}
              fullWidth
              disabled={otpRequested}
            />
            {otpRequested && (
              <TextField
                label={t("settings.generalPanel.otpCode")}
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
            {t("settings.generalPanel.cancel")}
          </Button>
          {!otpRequested ? (
            <Button
              variant="contained"
              onClick={handleRequestOtp}
              disabled={requestingOtp}
            >
              {requestingOtp ? t("settings.generalPanel.sending") : t("settings.generalPanel.sendOtp")}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
            >
              {verifyingOtp ? t("settings.generalPanel.verifying") : t("settings.generalPanel.verifyOtp")}
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
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
