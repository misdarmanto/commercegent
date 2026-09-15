import {
  Box,
  Button,
  Card,
  FormHelperText,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { AddressFormType, AddressSchema } from "../../validations/addresSchema";
import { IAddress } from "../../interfaces/Address";

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

const findNameById = (
  list: { id: string; name: string }[] | undefined,
  id: string,
) => {
  if (!list?.length) return "";
  const item = list.find((i) => String(i.id) === String(id));
  return item?.name ?? "";
};

export default function AddressSettingsView() {
  const { handleGetRequest, handlePostRequest } = useHttp();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [regencies, setRegencies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [position, setPosition] = useState<[number, number]>([
    -6.2, 106.816666,
  ]);

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
      addressDetail: "",
      addressPostalCode: "",
      addressProvinsiId: "",
      addressProvinsiName: "",
      addressKabupatenId: "",
      addressKabupatenName: "",
      addressKecamatanId: "",
      addressKecamatanName: "",
      addressDesaId: "",
      addressDesaName: "",
      addressLatitude: "",
      addressLongitude: "",
    },
  });

  const getIdByName = (list: { id: string; name: string }[], name?: string) => {
    if (!name) return "";
    const item = list.find((i) => i.name === name);
    return item ? String(item.id) : "";
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const provRes = await handleGetRequest({ path: "/regions/provinces" });
      if (provRes) {
        setProvinces(provRes);
      }

      const d: IAddress | undefined = await handleGetRequest({
        path: "/addresses/admins",
      });
      if (!d) {
        return;
      }

      setValue("addressUserName", d.addressUserName ?? "");
      setValue("addressKontak", d.addressKontak ?? "");
      setValue("addressDetail", d.addressDetail ?? "");
      setValue("addressPostalCode", d.addressPostalCode ?? "");
      setValue(
        "addressLatitude",
        d.addressLatitude != null ? String(d.addressLatitude) : "",
      );
      setValue(
        "addressLongitude",
        d.addressLongitude != null ? String(d.addressLongitude) : "",
      );

      if (d.addressLatitude && d.addressLongitude) {
        setPosition([Number(d.addressLatitude), Number(d.addressLongitude)]);
      }

      const provList = provRes ?? [];

      let pId = "";
      if (d.addressProvinsiId) {
        pId = String(d.addressProvinsiId);
        setValue("addressProvinsiId", pId);
        setValue(
          "addressProvinsiName",
          d.addressProvinsiName ?? findNameById(provList, pId) ?? "",
        );
      } else if (d.addressProvinsi) {
        pId = getIdByName(provList, d.addressProvinsi);
        if (pId) {
          setValue("addressProvinsiId", pId);
          setValue("addressProvinsiName", d.addressProvinsi);
        }
      }
      setProvinceId(pId);
      if (!pId) return;

      const reg = await handleGetRequest({
        path: `/regions/regencies/${pId}`,
      });
      if (reg) setRegencies(reg);

      let rId = "";
      if (d.addressKabupatenId) {
        rId = String(d.addressKabupatenId);
        setValue("addressKabupatenId", rId);
        setValue(
          "addressKabupatenName",
          d.addressKabupatenName ?? findNameById(reg, rId) ?? "",
        );
      } else if (d.addressKabupaten) {
        rId = getIdByName(reg || [], d.addressKabupaten);
        if (rId) {
          setValue("addressKabupatenId", rId);
          setValue("addressKabupatenName", d.addressKabupaten);
        }
      }
      setRegencyId(rId);
      if (!rId) return;

      const dist = await handleGetRequest({
        path: `/regions/districts/${rId}`,
      });
      if (dist) setDistricts(dist);

      let distId = "";
      if (d.addressKecamatanId) {
        distId = String(d.addressKecamatanId);
        setValue("addressKecamatanId", distId);
        setValue(
          "addressKecamatanName",
          d.addressKecamatanName ?? findNameById(dist, distId) ?? "",
        );
      } else if (d.addressKecamatan) {
        distId = getIdByName(dist || [], d.addressKecamatan);
        if (distId) {
          setValue("addressKecamatanId", distId);
          setValue("addressKecamatanName", d.addressKecamatan);
        }
      }
      setDistrictId(distId);
      if (!distId) return;

      const vill = await handleGetRequest({
        path: `/regions/villages/${distId}`,
      });
      if (vill) setVillages(vill);

      let vId = "";
      if (d.addressDesaId) {
        vId = String(d.addressDesaId);
        setValue("addressDesaId", vId);
        setValue(
          "addressDesaName",
          d.addressDesaName ?? findNameById(vill, vId) ?? "",
        );
      } else if (d.addressDesa) {
        vId = getIdByName(vill || [], d.addressDesa);
        if (vId) {
          setValue("addressDesaId", vId);
          setValue("addressDesaName", d.addressDesa);
        }
      }
      setVillageId(vId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (id: string) => {
    setProvinceId(id);
    setRegencyId("");
    setDistrictId("");
    setVillageId("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    const selected = provinces.find((p) => String(p.id) === String(id));
    setValue("addressProvinsiId", id);
    setValue("addressProvinsiName", selected?.name || "");
    setValue("addressKabupatenId", "");
    setValue("addressKabupatenName", "");
    setValue("addressKecamatanId", "");
    setValue("addressKecamatanName", "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");

    const res = await handleGetRequest({ path: `/regions/regencies/${id}` });
    if (res) setRegencies(res);
  };

  const handleRegencyChange = async (id: string) => {
    setRegencyId(id);
    setDistrictId("");
    setVillageId("");
    setDistricts([]);
    setVillages([]);

    const selected = regencies.find((r) => String(r.id) === String(id));
    setValue("addressKabupatenId", id);
    setValue("addressKabupatenName", selected?.name || "");
    setValue("addressKecamatanId", "");
    setValue("addressKecamatanName", "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");

    const res = await handleGetRequest({ path: `/regions/districts/${id}` });
    if (res) setDistricts(res);
  };

  const handleDistrictChange = async (id: string) => {
    setDistrictId(id);
    setVillageId("");
    setVillages([]);

    const selected = districts.find((d) => String(d.id) === String(id));
    setValue("addressKecamatanId", id);
    setValue("addressKecamatanName", selected?.name || "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");

    const res = await handleGetRequest({ path: `/regions/villages/${id}` });
    if (res) setVillages(res);
  };

  const handleVillageChange = (id: string) => {
    setVillageId(id);
    const selected = villages.find((v) => String(v.id) === String(id));
    setValue("addressDesaId", id);
    setValue("addressDesaName", selected?.name || "");
  };

  const handleMapChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setValue("addressLatitude", String(lat));
    setValue("addressLongitude", String(lng));
  };

  const onSubmit = async (data: AddressFormType) => {
    try {
      const body = {
        addressUserName: data.addressUserName,
        addressKontak: data.addressKontak,
        addressDetail: data.addressDetail,
        addressPostalCode: data.addressPostalCode,
        addressProvinsiId: data.addressProvinsiId,
        addressProvinsiName: data.addressProvinsiName,
        addressKabupatenId: data.addressKabupatenId,
        addressKabupatenName: data.addressKabupatenName,
        addressKecamatanId: data.addressKecamatanId,
        addressKecamatanName: data.addressKecamatanName,
        addressDesaId: data.addressDesaId,
        addressDesaName: data.addressDesaName,
        addressLatitude: data.addressLatitude,
        addressLongitude: data.addressLongitude,
      };

      await handlePostRequest({
        path: "/addresses/admins",
        body,
      });
      setSnackbarMessage("Alamat berhasil disimpan!");
      setOpenSnackbar(true);
    } catch {
      setSnackbarMessage("Terjadi kesalahan saat menyimpan data.");
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    loadInitialData();
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

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Provinsi"
                fullWidth
                value={provinceId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                error={!!errors.addressProvinsiId}
              >
                {provinces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
              {errors.addressProvinsiId && (
                <FormHelperText error>
                  {errors.addressProvinsiId.message}
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Kabupaten / Kota"
                fullWidth
                disabled={!provinceId}
                value={regencyId}
                onChange={(e) => handleRegencyChange(e.target.value)}
                error={!!errors.addressKabupatenId}
              >
                {regencies.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
              {errors.addressKabupatenId && (
                <FormHelperText error>
                  {errors.addressKabupatenId.message}
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Kecamatan"
                fullWidth
                disabled={!regencyId}
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                error={!!errors.addressKecamatanId}
              >
                {districts.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              {errors.addressKecamatanId && (
                <FormHelperText error>
                  {errors.addressKecamatanId.message}
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Desa / Kelurahan"
                fullWidth
                disabled={!districtId}
                value={villageId}
                onChange={(e) => handleVillageChange(e.target.value)}
                error={!!errors.addressDesaId}
              >
                {villages.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </TextField>
              {errors.addressDesaId && (
                <FormHelperText error>
                  {errors.addressDesaId.message}
                </FormHelperText>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Detail Alamat"
                fullWidth
                multiline
                rows={3}
                {...register("addressDetail")}
                error={!!errors.addressDetail}
                helperText={errors.addressDetail?.message}
              />
            </Grid>

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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                fullWidth
                {...register("addressLatitude")}
                error={!!errors.addressLatitude}
                helperText={errors.addressLatitude?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                fullWidth
                {...register("addressLongitude")}
                error={!!errors.addressLongitude}
                helperText={errors.addressLongitude?.message}
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
        <Alert
          severity={snackbarMessage.includes("kesalahan") ? "error" : "success"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
