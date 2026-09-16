"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import { useHighlightedProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/product/ProductCard";

export function HighlightedProducts() {
  const { data, isLoading } = useHighlightedProducts();
  const items = data?.items ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <LocalFireDepartmentIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Promo & Pilihan Terbaik
        </Typography>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "auto",
            pb: 1,
            "& > *": { flex: "0 0 auto", width: { xs: 150, sm: 190 } },
          }}
        >
          {items.map((product) => (
            <Box key={product.productId}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
