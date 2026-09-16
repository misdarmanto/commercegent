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
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import {
  useLocalShippings,
  useCreateLocalShipping,
  useRemoveLocalShipping,
  type LocalShippingListItem,
} from "../../services/settings";
import {
  useProvinces,
  fetchRegencies,
  type RegionOption,
} from "../../services/regions";
import {
  LocalShippingFormInputType,
  LocalShippingFormType,
  getLocalShippingSchema,
} from "../../validations/settingsSchema";

export default function ShipmentSettingsView() {
  const { t } = useTranslation();
  const { data: provinces = [] } = useProvinces();
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const { data: rows = [], isLoading: loadingList } = useLocalShippings();
  const createLocalShipping = useCreateLocalShipping();
  const removeLocalShipping = useRemoveLocalShipping();
  const saving = createLocalShipping.isPending;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LocalShippingListItem | null>(
    null,
  );
  const deleting = removeLocalShipping.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LocalShippingFormInputType, unknown, LocalShippingFormType>({
    resolver: zodResolver(getLocalShippingSchema()),
    defaultValues: {
      localShippingCompanyName: "",
      localShippingProvinceName: "",
      localShippingProvinceId: "",
      localShippingPricePerKg: 0,
      localShippingDuration: "",
    },
  });

  const provinceId = watch("localShippingProvinceId");
  const kabupatenId = watch("localShippingKabupatenId");

  const onProvinceSelect = async (id: string) => {
    const p = provinces.find((x) => x.id === id);
    setValue("localShippingProvinceId", id, { shouldValidate: true });
    setValue("localShippingProvinceName", p?.name ?? "", {
      shouldValidate: true,
    });
    setValue("localShippingKabupatenId", "", { shouldValidate: true });
    setValue("localShippingKabupatenName", "", { shouldValidate: true });
    setRegencies([]);

    if (!id) return;

    const res = await fetchRegencies(id);
    setRegencies(res);
  };

  const onKabupatenSelect = (id: string) => {
    const r = regencies.find((x) => x.id === id);
    setValue("localShippingKabupatenId", id, { shouldValidate: true });
    setValue("localShippingKabupatenName", r?.name ?? "", {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: LocalShippingFormType) => {
    try {
      await createLocalShipping.mutateAsync({
        localShippingCompanyName: data.localShippingCompanyName,
        localShippingProvinceName: data.localShippingProvinceName,
        localShippingProvinceId: data.localShippingProvinceId,
        localShippingKabupatenName: data.localShippingKabupatenName,
        localShippingKabupatenId: data.localShippingKabupatenId,
        localShippingPricePerKg: data.localShippingPricePerKg,
        localShippingDuration: data.localShippingDuration,
      });
      setSnackbarMessage(t("settings.shipmentPanel.savedSuccess"));
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setRegencies([]);
      reset({
        localShippingCompanyName: "",
        localShippingProvinceName: "",
        localShippingProvinceId: "",
        localShippingKabupatenName: "",
        localShippingKabupatenId: "",
        localShippingPricePerKg: 0,
        localShippingDuration: "",
      });
    } catch (e) {
      console.error(e);
      setSnackbarMessage(t("settings.shipmentPanel.errorSaving"));
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const provinceNameById = (id: string) =>
    provinces.find((p) => p.id === id)?.name ?? id;

  const openDelete = (row: LocalShippingListItem) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedRow == null) return;
    try {
      await removeLocalShipping.mutateAsync(selectedRow.localShippingId);
      setSnackbarMessage(t("settings.shipmentPanel.deletedSuccess"));
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      setSelectedRow(null);
    } catch (e) {
      console.error(e);
      setSnackbarMessage(t("settings.shipmentPanel.errorDeleting"));
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
          { label: t("settings.shipment"), link: "/settings?tab=shipment" },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t("settings.shipmentPanel.addTitle")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("settings.shipmentPanel.companyName")}
                error={!!errors.localShippingCompanyName}
                helperText={errors.localShippingCompanyName?.message}
                {...register("localShippingCompanyName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label={t("settings.shipmentPanel.province")}
                value={provinceId}
                onChange={(e) => void onProvinceSelect(e.target.value)}
                error={!!errors.localShippingProvinceId}
                helperText={errors.localShippingProvinceId?.message}
              >
                <MenuItem value="">
                  <em>{t("settings.shipmentPanel.selectProvince")}</em>
                </MenuItem>
                {provinces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label={t("settings.shipmentPanel.regency")}
                value={kabupatenId}
                onChange={(e) => onKabupatenSelect(e.target.value)}
                error={!!errors.localShippingKabupatenId}
                helperText={errors.localShippingKabupatenId?.message}
                disabled={!provinceId || regencies.length === 0}
              >
                <MenuItem value="">
                  <em>{t("settings.shipmentPanel.selectRegency")}</em>
                </MenuItem>
                {regencies.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t("settings.shipmentPanel.pricePerKg")}
                inputProps={{ min: 0, step: 1 }}
                error={!!errors.localShippingPricePerKg}
                helperText={errors.localShippingPricePerKg?.message}
                {...register("localShippingPricePerKg")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("settings.shipmentPanel.duration")}
                type="number"
                error={!!errors.localShippingDuration}
                helperText={errors.localShippingDuration?.message}
                {...register("localShippingDuration")}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="outlined" disabled={saving}>
              {saving ? t("settings.shipmentPanel.saving") : t("settings.shipmentPanel.save")}
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {t("settings.shipmentPanel.listTitle")}
        </Typography>
        {loadingList ? (
          <Typography color="text.secondary">{t("settings.shipmentPanel.loading")}</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">{t("settings.shipmentPanel.noData")}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("settings.shipmentPanel.column.id")}</TableCell>
                  <TableCell>{t("settings.shipmentPanel.column.companyName")}</TableCell>
                  <TableCell>{t("settings.shipmentPanel.column.province")}</TableCell>
                  <TableCell>{t("settings.shipmentPanel.column.regency")}</TableCell>
                  <TableCell align="right">{t("settings.shipmentPanel.column.pricePerKg")}</TableCell>
                  <TableCell>{t("settings.shipmentPanel.column.duration")}</TableCell>
                  <TableCell align="right" width={120}>
                    {t("settings.shipmentPanel.column.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.localShippingId}>
                    <TableCell>{r.localShippingId}</TableCell>
                    <TableCell>{r.localShippingCompanyName}</TableCell>
                    <TableCell>
                      {provinceNameById(String(r.localShippingProvinceId))}
                    </TableCell>
                    <TableCell>
                      {r.localShippingKabupatenName ??
                        r.localShippingKabupatenId ??
                        "-"}
                    </TableCell>
                    <TableCell align="right">
                      {r.localShippingPricePerKg?.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{r.localShippingDuration}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDelete(r)}
                      >
                        {t("settings.shipmentPanel.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleting && setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("settings.shipmentPanel.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("settings.shipmentPanel.confirmDeleteMessage", {
              id: selectedRow?.localShippingId ?? "-",
              name: selectedRow?.localShippingCompanyName,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setSelectedRow(null);
            }}
            disabled={deleting}
          >
            {t("settings.shipmentPanel.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? t("settings.shipmentPanel.deleting") : t("settings.shipmentPanel.delete")}
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
