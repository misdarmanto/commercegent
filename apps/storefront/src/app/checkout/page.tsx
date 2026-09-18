"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useTranslation } from "react-i18next";
import { useCart } from "@/lib/api/cart";
import { useCreateOrder } from "@/lib/api/orders";
import { useAddresses } from "@/lib/api/addresses";
import { useShippingRates } from "@/lib/api/shipping";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLoggedIn } from "@/lib/auth/token";
import { ICartItem } from "@/interfaces/Cart";
import { IShippingRate } from "@/interfaces/Shipping";

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data: cartData, isLoading: isLoadingCart } = useCart();
  const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();
  const createOrder = useCreateOrder();
  const [selectedRateIndex, setSelectedRateIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  const items: ICartItem[] = useMemo(() => {
    if (!cartData) return [];
    return Array.isArray(cartData) ? cartData : cartData.items;
  }, [cartData]);

  const mainAddress = useMemo(
    () => addresses?.find((a) => a.addressType === "main"),
    [addresses],
  );

  const rateQueryItems = useMemo(
    () =>
      items.map((item) => ({
        productVariantId: item.variant.productVariantId,
        quantity: item.cartQuantity,
      })),
    [items],
  );

  const {
    data: rates = [],
    isLoading: isLoadingRates,
    isError: isRatesError,
  } = useShippingRates(rateQueryItems, { enabled: Boolean(mainAddress) });

  // Fall back to the first rate whenever the picked index doesn't exist in
  // the current quote (initial load, or a new quote invalidated the old
  // pick) instead of resetting state from an effect.
  const effectiveRateIndex =
    selectedRateIndex != null && selectedRateIndex < rates.length
      ? selectedRateIndex
      : rates.length > 0
        ? 0
        : null;

  const selectedRate: IShippingRate | null =
    effectiveRateIndex != null ? (rates[effectiveRateIndex] ?? null) : null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.productVariantSellPrice * item.cartQuantity,
    0,
  );
  const shippingFee = selectedRate?.price ?? 0;
  const grandTotal = subtotal + shippingFee;

  const handleCheckout = () => {
    if (!selectedRate) return;

    createOrder.mutate(
      {
        orderShippingProvider: selectedRate.provider,
        orderShippingFee: selectedRate.price,
        orderCourierCompany: selectedRate.courier_code,
        orderCourierType: selectedRate.courier_service_code,
        items: items.map((item) => ({
          orderItemProductWeight: item.variant.productVariantWeight,
          productId: item.cartProductId,
          productVariantId: item.variant.productVariantId,
          quantity: item.cartQuantity,
        })),
      },
      {
        onSuccess: (order) => {
          if (order.orderPaymentUrl) {
            window.location.href = order.orderPaymentUrl;
          } else {
            router.push("/orders");
          }
        },
      },
    );
  };

  const isLoading = !checkedAuth || isLoadingCart || isLoadingAddresses;

  if (isLoading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t("checkout.title")}
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          {t("checkout.empty")}
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Stack sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("checkout.shippingAddress")}
                </Typography>
                {mainAddress ? (
                  <>
                    <Typography sx={{ fontWeight: 700 }}>
                      {mainAddress.addressUserName} · {mainAddress.addressKontak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mainAddress.addressDetail}, {mainAddress.addressDesaName},{" "}
                      {mainAddress.addressKecamatanName},{" "}
                      {mainAddress.addressKabupatenName},{" "}
                      {mainAddress.addressProvinsiName}{" "}
                      {mainAddress.addressPostalCode}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("checkout.noAddress")}
                  </Typography>
                )}
              </Stack>
              <Button
                component={Link}
                href="/addresses?redirect=/checkout"
                size="small"
              >
                {mainAddress ? t("checkout.changeAddress") : t("checkout.addAddress")}
              </Button>
            </Stack>
          </Paper>

          {!mainAddress ? (
            <Alert severity="warning">{t("checkout.needsAddress")}</Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {t("checkout.selectCourier")}
              </Typography>

              {isLoadingRates ? (
                <Stack sx={{ alignItems: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : isRatesError || rates.length === 0 ? (
                <Alert severity="error">{t("checkout.noCourierAvailable")}</Alert>
              ) : (
                <RadioGroup
                  value={effectiveRateIndex ?? ""}
                  onChange={(e) => setSelectedRateIndex(Number(e.target.value))}
                >
                  {rates.map((rate, index) => (
                    <FormControlLabel
                      key={`${rate.courier_code}-${rate.courier_service_code}-${index}`}
                      value={index}
                      control={<Radio />}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        mx: 0,
                        mb: 1,
                        px: 1,
                      }}
                      label={
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            py: 1,
                          }}
                        >
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {rate.courier_name} - {rate.courier_service_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rate.duration}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(rate.price)}
                          </Typography>
                        </Stack>
                      }
                    />
                  ))}
                </RadioGroup>
              )}
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {items.map((item) => (
                <Stack
                  key={item.cartId}
                  direction="row"
                  sx={{ justifyContent: "space-between" }}
                >
                  <Typography variant="body2">
                    {item.product.productName} x{item.cartQuantity}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(
                      item.variant.productVariantSellPrice * item.cartQuantity,
                    )}
                  </Typography>
                </Stack>
              ))}

              <Divider />

              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2">{t("checkout.subtotal")}</Typography>
                <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2">{t("checkout.shipping")}</Typography>
                <Typography variant="body2">{formatCurrency(shippingFee)}</Typography>
              </Stack>

              <Divider />

              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="h6">{t("checkout.total")}</Typography>
                <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800 }}>
                  {formatCurrency(grandTotal)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {createOrder.isError && (
            <Alert severity="error">{t("checkout.orderError")}</Alert>
          )}

          <Button
            variant="contained"
            size="large"
            disabled={!mainAddress || !selectedRate || createOrder.isPending}
            onClick={handleCheckout}
          >
            {createOrder.isPending ? t("checkout.processing") : t("checkout.payNow")}
          </Button>
        </Stack>
      )}
    </Container>
  );
}
