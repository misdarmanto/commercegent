"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import { useOrders } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLoggedIn } from "@/lib/auth/token";
import { IOrder } from "@/interfaces/Order";

export default function OrdersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data, isLoading } = useOrders();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates rendering on a one-time client-only auth check
    setCheckedAuth(true);
  }, [router]);

  const orders: IOrder[] = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.items;
  }, [data]);

  if (!checkedAuth || isLoading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t("orders.title")}
      </Typography>

      {orders.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          {t("orders.empty")}
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {orders.map((order) => (
            <Paper key={order.orderId} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Stack>
                  <Typography sx={{ fontWeight: 600 }}>
                    {order.orderReferenceId ?? `Order #${order.orderId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("orders.itemCount", { count: order.orderTotalItem })}
                  </Typography>
                </Stack>
                <Stack sx={{ alignItems: "flex-end" }}>
                  <Chip label={t(`orders.status.${order.orderStatus}`)} size="small" />
                  <Typography sx={{ fontWeight: 700, color: "primary.main", mt: 0.5 }}>
                    {formatCurrency(order.orderGrandTotal)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
