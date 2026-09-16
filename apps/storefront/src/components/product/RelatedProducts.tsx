"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/product/ProductCard";

const RECOMMENDATION_COUNT = 5;

export function RelatedProducts({
  categoryId,
  excludeProductId,
}: {
  categoryId?: number;
  excludeProductId: number | string;
}) {
  const { data, isLoading } = useProducts({
    productCategoryId: categoryId,
    size: RECOMMENDATION_COUNT + 1,
  });

  const items = (data?.items ?? [])
    .filter((product) => String(product.productId) !== String(excludeProductId))
    .slice(0, RECOMMENDATION_COUNT);

  if (!isLoading && items.length === 0) return null;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
        Rekomendasi Produk Lain
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {items.map((product) => (
            <Grid key={product.productId} size={{ xs: 6, sm: 4, md: 12 / 5 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
