"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import { useCart } from "@/lib/api/cart";
import { useCreateOrder } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLoggedIn } from "@/lib/auth/token";
import { ICartItem } from "@/interfaces/Cart";

const SHIPPING_FEE = 0;

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data, isLoading } = useCart();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  const items: ICartItem[] = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.items;
  }, [data]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.productVariantSellPrice * item.cartQuantity,
    0,
  );
  const grandTotal = subtotal + SHIPPING_FEE;

  const handleCheckout = () => {
    createOrder.mutate(
      {
        orderShippingProvider: "FRESH",
        orderShippingFee: SHIPPING_FEE,
        orderCourierCompany: null,
        orderCourierType: null,
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

  if (!checkedAuth || isLoading) {
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
                <Typography variant="body2">{formatCurrency(SHIPPING_FEE)}</Typography>
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
            disabled={createOrder.isPending}
            onClick={handleCheckout}
          >
            {createOrder.isPending ? t("checkout.processing") : t("checkout.payNow")}
          </Button>
        </Stack>
      )}
    </Container>
  );
}
