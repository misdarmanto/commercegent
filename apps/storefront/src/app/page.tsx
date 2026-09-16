"use client";

import { useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import { useProducts } from "@/lib/api/products";
import { ProductCard } from "@/components/product/ProductCard";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useProducts({ search: search || undefined });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Produk Segar Pilihan
      </Typography>

      <TextField
        fullWidth
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 480 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {data?.items.map((product) => (
            <Grid key={product.productId} size={{ xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
          {data?.items.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
                Produk tidak ditemukan.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}
