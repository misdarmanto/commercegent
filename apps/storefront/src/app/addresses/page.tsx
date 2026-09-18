"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { useAddresses, useRemoveAddress, useSetMainAddress } from "@/lib/api/addresses";
import { isLoggedIn } from "@/lib/auth/token";

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <AddressesPageContent />
    </Suspense>
  );
}

function AddressesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data: addresses = [], isLoading } = useAddresses();
  const setMainAddress = useSetMainAddress();
  const removeAddress = useRemoveAddress();

  const redirectTo = searchParams.get("redirect");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth || isLoading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const newAddressHref = redirectTo
    ? `/addresses/new?redirect=${encodeURIComponent(redirectTo)}`
    : "/addresses/new";

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <IconButton
            onClick={() => router.push("/profile")}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t("address.title")}
          </Typography>
        </Stack>
      </Stack>

      {redirectTo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("address.selectOrAddPrompt")}
        </Alert>
      )}

      <Stack spacing={2}>
        {addresses.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            {t("address.empty")}
          </Typography>
        ) : (
          addresses.map((address) => (
            <Paper key={address.addressId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Stack sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {address.addressUserName}
                    </Typography>
                    {address.addressType === "main" && (
                      <Chip
                        label={t("address.main")}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {address.addressKontak}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {address.addressDetail}, {address.addressDesaName},{" "}
                    {address.addressKecamatanName}, {address.addressKabupatenName},{" "}
                    {address.addressProvinsiName} {address.addressPostalCode}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  color="error"
                  disabled={removeAddress.isPending}
                  onClick={() => removeAddress.mutate(address.addressId)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                {redirectTo ? (
                  <Button
                    size="small"
                    variant={address.addressType === "main" ? "outlined" : "contained"}
                    disabled={setMainAddress.isPending}
                    onClick={async () => {
                      if (address.addressType !== "main") {
                        await setMainAddress.mutateAsync(address.addressId);
                      }
                      router.push(redirectTo);
                    }}
                  >
                    {address.addressType === "main"
                      ? t("address.useThisAddress")
                      : t("address.selectAndUse")}
                  </Button>
                ) : (
                  address.addressType !== "main" && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={setMainAddress.isPending}
                      onClick={() => setMainAddress.mutate(address.addressId)}
                    >
                      {t("address.setAsMain")}
                    </Button>
                  )
                )}
              </Stack>
            </Paper>
          ))
        )}

        <Button
          component={Link}
          href={newAddressHref}
          variant="outlined"
          startIcon={<AddIcon />}
        >
          {t("address.addNew")}
        </Button>
      </Stack>
    </Container>
  );
}
