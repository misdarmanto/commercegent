import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { IAddressesModel } from "../../models/addressModel";
import { AddressFormType, AddressSchema } from "../../validations/addresSchema";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

/* ===============================
   FIX LEAFLET MARKER ICON
================================ */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ===============================
   DRAGGABLE MARKER COMPONENT
================================ */
function DraggableMarker({
  position,
  onChange,
}: {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}) {
  const [markerPos, setMarkerPos] = useState(position);

  useEffect(() => {
    setMarkerPos(position);
  }, [position]);

  useMapEvents({
    click(e) {
      setMarkerPos([e.latlng.lat, e.latlng.lng]);
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable
      position={markerPos}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          setMarkerPos([latlng.lat, latlng.lng]);
          onChange(latlng.lat, latlng.lng);
        },
      }}
    />
  );
}

export default function AddressSettingsView() {
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ======================
     REGION STATE
  ====================== */
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");

  /* ======================
     MAP STATE
  ====================== */
  const [position, setPosition] = useState<[number, number]>([
    -6.2,
    106.816666, // default Jakarta
  ]);

  /* ======================
     FORM
  ====================== */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      addressUserName: "",
      addressKontak: "",
      addressPostalCode: "",
      addressProvinsi: "",
      addressKabupaten: "",
      addressKecamatan: "",
      addressDesa: "",
      addressDetail: "",
      addressLatitude: "",
      addressLongitude: "",
    },
  });

  const getIdByName = (list: any[], name?: string) => {
    const item = list.find((i) => i.name === name);
    return item ? item.id : "";
  };

  const preloadAddress = async () => {
    try {
      const detail: IAddressesModel = await handleGetRequest({
        path: "/addresses",
      });

      if (!detail) return;

      Object.entries(detail).forEach(([key, value]) => {
        setValue(key as keyof AddressFormType, value as string);
      });

      if (detail.addressLatitude && detail.addressLongitude) {
        setPosition([
          Number(detail.addressLatitude),
          Number(detail.addressLongitude),
        ]);
      }

      const pId = getIdByName(provinces, detail.addressProvinsi);
      if (!pId) return;

      setProvinceId(pId);

      const reg = await handleGetRequest({
        path: `/addresses/regencies/${pId}`,
      });
      setRegencies(reg);

      const rId = getIdByName(reg, detail.addressKabupaten);
      if (!rId) return;

      setRegencyId(rId);

      const dist = await handleGetRequest({
        path: `/addresses/districts/${rId}`,
      });
      setDistricts(dist);

      const dId = getIdByName(dist, detail.addressKecamatan);
      if (!dId) return;

      setDistrictId(dId);

      const vill = await handleGetRequest({
        path: `/addresses/villages/${dId}`,
      });
      setVillages(vill);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); // 🔥 INI YANG KEMARIN HILANG
    }
  };

  /* ======================
     FETCH DATA
  ====================== */
  const fetchProvinces = async () => {
    const res = await handleGetRequest({
      path: "/addresses/provinces",
    });
    if (res) setProvinces(res);
  };

  const getDetailSettings = async () => {
    try {
      const result: IAddressesModel = await handleGetRequest({
        path: "/addresses/admins",
      });

      if (result) {
        Object.entries(result).forEach(([key, value]) => {
          setValue(key as keyof AddressFormType, value as string);
        });

        if (result.addressLatitude && result.addressLongitude) {
          setPosition([
            Number(result.addressLatitude),
            Number(result.addressLongitude),
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     CASCADING HANDLER
  ====================== */
  const handleProvinceChange = async (id: string) => {
    setProvinceId(id);
    setRegencyId("");
    setDistrictId("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    const selected = provinces.find((p) => p.id === id);
    setValue("addressProvinsi", selected?.name || "");
    setValue("addressKabupaten", "");
    setValue("addressKecamatan", "");
    setValue("addressDesa", "");

    const res = await handleGetRequest({
      path: `/addresses/regencies/${id}`,
    });
    if (res) setRegencies(res);
  };

  const handleRegencyChange = async (id: string) => {
    setRegencyId(id);
    setDistrictId("");
    setDistricts([]);
    setVillages([]);

    const selected = regencies.find((r) => r.id === id);
    setValue("addressKabupaten", selected?.name || "");
    setValue("addressKecamatan", "");
    setValue("addressDesa", "");

    const res = await handleGetRequest({
      path: `/addresses/districts/${id}`,
    });
    if (res) setDistricts(res);
  };

  const handleDistrictChange = async (id: string) => {
    setDistrictId(id);
    setVillages([]);

    const selected = districts.find((d) => d.id === id);
    setValue("addressKecamatan", selected?.name || "");
    setValue("addressDesa", "");

    const res = await handleGetRequest({
      path: `/addresses/villages/${id}`,
    });
    if (res) setVillages(res);
  };

  const handleVillageChange = (id: string) => {
    const selected = villages.find((v) => v.id === id);
    setValue("addressDesa", selected?.name || "");
  };

  /* ======================
     MAP HANDLER
  ====================== */
  const handleMapChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setValue("addressLatitude", String(lat));
    setValue("addressLongitude", String(lng));
  };

  /* ======================
     SUBMIT
  ====================== */
  const onSubmit = async (data: AddressFormType) => {
    try {
      await handlePostRequest({
        path: "/addresses/admins",
        body: data,
      });
      setSnackbarMessage("Alamat berhasil disimpan!");
      setOpenSnackbar(true);
    } catch {
      setSnackbarMessage("Terjadi kesalahan saat menyimpan data.");
      setOpenSnackbar(true);
    }
  };

  /* ======================
     EFFECT
  ====================== */
  useEffect(() => {
    preloadAddress();
    fetchProvinces();
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
          { label: "Address", link: "/settings" },
        ]}
      />

      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* BASIC INFO */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nama"
                fullWidth
                {...register("addressUserName")}
                error={!!errors.addressUserName}
                helperText={errors.addressUserName?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kontak"
                fullWidth
                {...register("addressKontak")}
                error={!!errors.addressKontak}
                helperText={errors.addressKontak?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kode Pos"
                fullWidth
                {...register("addressPostalCode")}
                error={!!errors.addressPostalCode}
                helperText={errors.addressPostalCode?.message}
              />
            </Grid>

            {/* PROVINSI */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Provinsi"
                fullWidth
                value={provinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                {provinces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* KABUPATEN */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Kabupaten / Kota"
                fullWidth
                disabled={!provinceId}
                value={regencyId}
                onChange={(e) => handleRegencyChange(e.target.value)}
              >
                {regencies.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* KECAMATAN */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Kecamatan"
                fullWidth
                disabled={!regencyId}
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                {districts.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DESA */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Desa / Kelurahan"
                fullWidth
                disabled={!districtId}
                onChange={(e) => handleVillageChange(e.target.value)}
              >
                {villages.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DETAIL */}
            <Grid item xs={12}>
              <TextField
                label="Detail Alamat"
                fullWidth
                multiline
                rows={3}
                {...register("addressDetail")}
              />
            </Grid>

            {/* MAP */}
            <Grid item xs={12}>
              <Typography fontWeight="bold" mb={1}>
                Pilih Lokasi (Klik / Geser Marker)
              </Typography>

              <MapContainer
                center={position}
                zoom={10}
                style={{ height: 300, borderRadius: 12 }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                  position={position}
                  onChange={handleMapChange}
                />
              </MapContainer>
            </Grid>

            {/* COORDINATE */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                fullWidth
                {...register("addressLatitude")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                fullWidth
                {...register("addressLongitude")}
              />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" mt={5}>
            <Button variant="outlined" type="submit">
              Simpan
            </Button>
          </Stack>
        </Box>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
