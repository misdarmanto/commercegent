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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useHttp } from "../../hooks/http";
import {
  LocalShippingFormInputType,
  LocalShippingFormType,
  LocalShippingSchema,
} from "../../validations/settingsSchema";

type ProvinceOption = { id: string; name: string };

interface LocalShippingListItem {
  localShippingId: number;
  localShippingCompanyName: string;
  localShippingProvinceId: string;
  localShippingPricePerKg: number;
  localShippingDuration: string;
  deleted: boolean;
}

interface LocalShippingListResponse {
  totalItems: number;
  items: LocalShippingListItem[];
  totalPages: number;
  currentPage: number;
}

const normalizeProvinces = (raw: unknown): ProvinceOption[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((p: { id: string | number; name: string }) => ({
    id: String(p.id),
    name: p.name,
  }));
};

export default function ShipmentSettingsView() {
  const { handleGetRequest, handlePostRequest, handleRemoveRequest } =
    useHttp();

  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [rows, setRows] = useState<LocalShippingListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LocalShippingListItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LocalShippingFormInputType, unknown, LocalShippingFormType>({
    resolver: zodResolver(LocalShippingSchema),
    defaultValues: {
      localShippingCompanyName: "",
      localShippingProvinceName: "",
      localShippingProvinceId: "",
      localShippingPricePerKg: 0,
      localShippingDuration: "",
    },
  });

  const provinceId = watch("localShippingProvinceId");

  const loadProvinces = async () => {
    const res = await handleGetRequest({ path: "/regions/provinces" });
    if (res) {
      setProvinces(normalizeProvinces(res));
    }
  };

  const loadShippings = async () => {
    setLoadingList(true);
    try {
      const result: LocalShippingListResponse = await handleGetRequest({
        path: "/local-shippings",
      });
      if (result?.items) {
        setRows(result.items.filter((r) => !r.deleted));
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error(e);
      setSnackbarMessage("Gagal memuat data pengiriman lokal.");
      setOpenSnackbar(true);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadProvinces();
    void loadShippings();
  }, []);

  const onProvinceSelect = (id: string) => {
    const p = provinces.find((x) => x.id === id);
    setValue("localShippingProvinceId", id, { shouldValidate: true });
    setValue("localShippingProvinceName", p?.name ?? "", {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: LocalShippingFormType) => {
    try {
      setSaving(true);
      await handlePostRequest({
        path: "/local-shippings",
        body: {
          localShippingCompanyName: data.localShippingCompanyName,
          localShippingProvinceName: data.localShippingProvinceName,
          localShippingProvinceId: data.localShippingProvinceId,
          localShippingPricePerKg: data.localShippingPricePerKg,
          localShippingDuration: data.localShippingDuration,
        },
      });
      setSnackbarMessage("Pengiriman lokal berhasil disimpan.");
      setOpenSnackbar(true);
      reset({
        localShippingCompanyName: "",
        localShippingProvinceName: "",
        localShippingProvinceId: "",
        localShippingPricePerKg: 0,
        localShippingDuration: "",
      });
      await loadShippings();
    } catch (e) {
      console.error(e);
      setSnackbarMessage("Gagal menyimpan data pengiriman lokal.");
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
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
      setDeleting(true);
      await handleRemoveRequest({
        path: `/local-shippings/${selectedRow.localShippingId}`,
      });
      setSnackbarMessage("Pengiriman lokal berhasil dihapus.");
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      setSelectedRow(null);
      await loadShippings();
    } catch (e) {
      console.error(e);
      setSnackbarMessage("Gagal menghapus data pengiriman lokal.");
      setOpenSnackbar(true);
    } finally {
      setDeleting(false);
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
          { label: "Shipment", link: "/settings?tab=shipment" },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Tambah pengiriman lokal
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nama perusahaan"
                error={!!errors.localShippingCompanyName}
                helperText={errors.localShippingCompanyName?.message}
                {...register("localShippingCompanyName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Provinsi (nama & kode dari data wilayah)"
                value={provinceId}
                onChange={(e) => onProvinceSelect(e.target.value)}
                error={!!errors.localShippingProvinceId}
                helperText={errors.localShippingProvinceId?.message}
              >
                <MenuItem value="">
                  <em>Pilih provinsi</em>
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
                fullWidth
                type="number"
                label="Harga per kg"
                inputProps={{ min: 0, step: 1 }}
                error={!!errors.localShippingPricePerKg}
                helperText={errors.localShippingPricePerKg?.message}
                {...register("localShippingPricePerKg")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Durasi (hari)"
                type="number"
                error={!!errors.localShippingDuration}
                helperText={errors.localShippingDuration?.message}
                {...register("localShippingDuration")}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="outlined" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Daftar pengiriman lokal
        </Typography>
        {loadingList ? (
          <Typography color="text.secondary">Memuat data...</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">Belum ada data.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nama perusahaan</TableCell>
                  <TableCell>Provinsi</TableCell>
                  <TableCell align="right">Harga / kg</TableCell>
                  <TableCell>Durasi (Hari)</TableCell>
                  <TableCell align="right" width={120}>
                    Aksi
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
                        Hapus
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
        <DialogTitle>Konfirmasi hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Hapus pengiriman lokal ID{" "}
            <strong>{selectedRow?.localShippingId ?? "-"}</strong> (
            {selectedRow?.localShippingCompanyName})?
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
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Hapus"}
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
          severity={snackbarMessage.includes("Gagal") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
