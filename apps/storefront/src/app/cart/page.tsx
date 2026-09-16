"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useCart, useRemoveCart, useUpdateCart } from "@/lib/api/cart";
import { getImageUrl } from "@/lib/utils/getImageUrl";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLoggedIn } from "@/lib/auth/token";
import { ICartItem } from "@/interfaces/Cart";

export default function CartPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { data, isLoading } = useCart();
  const updateCart = useUpdateCart();
  const removeCart = useRemoveCart();

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

  const total = items.reduce(
    (sum, item) => sum + item.variant.productVariantSellPrice * item.cartQuantity,
    0,
  );

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
        Keranjang Belanja
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          Keranjang Anda masih kosong.
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {items.map((item) => (
            <Paper key={item.cartId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box
                  component="img"
                  src={getImageUrl(item.variant.productVariantImage)}
                  alt={item.product.productName}
                  sx={{ width: 72, height: 72, objectFit: "cover", borderRadius: 2 }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 600 }}>
                    {item.product.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.variant.productVariantName}
                  </Typography>
                  <Typography sx={{ color: "primary.main", fontWeight: 700 }}>
                    {formatCurrency(item.variant.productVariantSellPrice)}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <IconButton
                    size="small"
                    disabled={updateCart.isPending}
                    onClick={() =>
                      updateCart.mutate({
                        cartId: item.cartId,
                        cartQuantity: Math.max(1, item.cartQuantity - 1),
                      })
                    }
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ px: 2 }}>{item.cartQuantity}</Typography>
                  <IconButton
                    size="small"
                    disabled={updateCart.isPending}
                    onClick={() =>
                      updateCart.mutate({
                        cartId: item.cartId,
                        cartQuantity: item.cartQuantity + 1,
                      })
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <IconButton
                  color="error"
                  disabled={removeCart.isPending}
                  onClick={() => removeCart.mutate(item.cartId)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}

          <Divider />

          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800 }}>
              {formatCurrency(total)}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </Button>
        </Stack>
      )}
    </Container>
  );
}
