"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useTranslation } from "react-i18next";
import { useCreateAddress } from "@/lib/api/addresses";
import {
  fetchDistricts,
  fetchRegencies,
  fetchVillages,
  useProvinces,
} from "@/lib/api/regions";
import { isLoggedIn } from "@/lib/auth/token";

const buildAddressSchema = (t: (key: string) => string) =>
  z.object({
    addressUserName: z.string().min(3, t("address.form.nameRequired")),
    addressKontak: z
      .string()
      .regex(/^[0-9+]+$/, t("address.form.contactInvalid"))
      .min(10, t("address.form.contactInvalid")),
    addressDetail: z.string().min(5, t("address.form.detailRequired")),
    addressPostalCode: z.string().regex(/^[0-9]+$/, t("address.form.postalInvalid")),
    addressProvinsiId: z.string().min(1, t("address.form.provinceRequired")),
    addressProvinsiName: z.string().min(1, t("address.form.provinceRequired")),
    addressKabupatenId: z.string().min(1, t("address.form.regencyRequired")),
    addressKabupatenName: z.string().min(1, t("address.form.regencyRequired")),
    addressKecamatanId: z.string().min(1, t("address.form.districtRequired")),
    addressKecamatanName: z.string().min(1, t("address.form.districtRequired")),
    addressDesaId: z.string().min(1, t("address.form.villageRequired")),
    addressDesaName: z.string().min(1, t("address.form.villageRequired")),
    addressLatitude: z.string().min(1, t("address.form.locationRequired")),
    addressLongitude: z.string().min(1, t("address.form.locationRequired")),
  });

type AddressForm = z.infer<ReturnType<typeof buildAddressSchema>>;

interface RegionOption {
  id: string;
  name: string;
}

export default function NewAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const createAddress = useCreateAddress();
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();

  const redirectTo = searchParams.get("redirect") || "/addresses";

  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(buildAddressSchema(t)),
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

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  const handleProvinceChange = async (id: string) => {
    const selected = provinces.find((p) => String(p.id) === id);
    setProvinceId(id);
    setRegencyId("");
    setDistrictId("");
    setVillageId("");
    setValue("addressProvinsiId", id);
    setValue("addressProvinsiName", selected?.name ?? "");
    setValue("addressKabupatenId", "");
    setValue("addressKabupatenName", "");
    setValue("addressKecamatanId", "");
    setValue("addressKecamatanName", "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (id) setRegencies(await fetchRegencies(id));
  };

  const handleRegencyChange = async (id: string) => {
    const selected = regencies.find((r) => String(r.id) === id);
    setRegencyId(id);
    setDistrictId("");
    setVillageId("");
    setValue("addressKabupatenId", id);
    setValue("addressKabupatenName", selected?.name ?? "");
    setValue("addressKecamatanId", "");
    setValue("addressKecamatanName", "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");
    setDistricts([]);
    setVillages([]);
    if (id) setDistricts(await fetchDistricts(id));
  };

  const handleDistrictChange = async (id: string) => {
    const selected = districts.find((d) => String(d.id) === id);
    setDistrictId(id);
    setVillageId("");
    setValue("addressKecamatanId", id);
    setValue("addressKecamatanName", selected?.name ?? "");
    setValue("addressDesaId", "");
    setValue("addressDesaName", "");
    setVillages([]);
    if (id) setVillages(await fetchVillages(id));
  };

  const handleVillageChange = (id: string) => {
    const selected = villages.find((v) => String(v.id) === id);
    setVillageId(id);
    setValue("addressDesaId", id);
    setValue("addressDesaName", selected?.name ?? "");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    setLocating(true);
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = String(position.coords.latitude);
        const longitude = String(position.coords.longitude);
        setCoordinates({ latitude, longitude });
        setValue("addressLatitude", latitude);
        setValue("addressLongitude", longitude);
        setLocating(false);
      },
      () => {
        setLocationError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmit = (values: AddressForm) => {
    createAddress.mutate(values, {
      onSuccess: () => {
        router.push(redirectTo);
      },
    });
  };

  if (!checkedAuth || loadingProvinces) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
          {t("address.form.title")}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {createAddress.isError && (
              <Alert severity="error">{t("address.form.saveError")}</Alert>
            )}

            <TextField
              label={t("address.form.name")}
              fullWidth
              {...register("addressUserName")}
              error={!!errors.addressUserName}
              helperText={errors.addressUserName?.message}
            />

            <TextField
              label={t("address.form.contact")}
              fullWidth
              {...register("addressKontak")}
              error={!!errors.addressKontak}
              helperText={errors.addressKontak?.message}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label={t("address.form.province")}
                  fullWidth
                  value={provinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  error={!!errors.addressProvinsiId}
                  helperText={errors.addressProvinsiId?.message}
                >
                  {provinces.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label={t("address.form.regency")}
                  fullWidth
                  disabled={!provinceId}
                  value={regencyId}
                  onChange={(e) => handleRegencyChange(e.target.value)}
                  error={!!errors.addressKabupatenId}
                  helperText={errors.addressKabupatenId?.message}
                >
                  {regencies.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label={t("address.form.district")}
                  fullWidth
                  disabled={!regencyId}
                  value={districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  error={!!errors.addressKecamatanId}
                  helperText={errors.addressKecamatanId?.message}
                >
                  {districts.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label={t("address.form.village")}
                  fullWidth
                  disabled={!districtId}
                  value={villageId}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  error={!!errors.addressDesaId}
                  helperText={errors.addressDesaId?.message}
                >
                  {villages.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label={t("address.form.postalCode")}
              fullWidth
              {...register("addressPostalCode")}
              error={!!errors.addressPostalCode}
              helperText={errors.addressPostalCode?.message}
            />

            <TextField
              label={t("address.form.detail")}
              fullWidth
              multiline
              rows={3}
              {...register("addressDetail")}
              error={!!errors.addressDetail}
              helperText={errors.addressDetail?.message}
            />

            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={
                  locating ? <CircularProgress size={16} /> : <LocationOnOutlinedIcon />
                }
                disabled={locating}
                onClick={handleUseCurrentLocation}
              >
                {locating
                  ? t("address.form.locating")
                  : t("address.form.useCurrentLocation")}
              </Button>
              {locationError && (
                <Alert severity="warning">{t("address.form.locationError")}</Alert>
              )}
              {coordinates.latitude && coordinates.longitude && (
                <Typography variant="body2" color="text.secondary">
                  {t("address.form.locationCaptured", {
                    lat: coordinates.latitude,
                    lng: coordinates.longitude,
                  })}
                </Typography>
              )}
              {(errors.addressLatitude || errors.addressLongitude) && (
                <Typography variant="caption" color="error">
                  {errors.addressLatitude?.message || errors.addressLongitude?.message}
                </Typography>
              )}
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={createAddress.isPending}
            >
              {createAddress.isPending
                ? t("address.form.saving")
                : t("address.form.save")}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
