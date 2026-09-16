"use client";

import { useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/lib/api/products";
import { useCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { HighlightedProducts } from "@/components/home/HighlightedProducts";
import { IPaginatedResult, ICategory } from "@/interfaces/Product";

const PRODUCTS_PER_PAGE = 10;

export default function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as IPaginatedResult<ICategory> | undefined)?.items ?? [];
  const { data, isLoading } = useProducts({
    search: search || undefined,
    productCategoryId: categoryId,
    page,
    size: PRODUCTS_PER_PAGE,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: number | undefined) => {
    setCategoryId(value);
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BannerCarousel />

      <HighlightedProducts />

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        {t("home.title")}
      </Typography>

      <TextField
        fullWidth
        placeholder={t("home.searchPlaceholder")}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
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

      {categories.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 3, overflowX: "auto", pb: 1 }}
        >
          <Chip
            label={t("home.allCategories")}
            color={categoryId === undefined ? "primary" : "default"}
            onClick={() => handleCategoryChange(undefined)}
          />
          {categories.map((category) => (
            <Chip
              key={category.categoryId}
              label={category.categoryName}
              color={categoryId === category.categoryId ? "primary" : "default"}
              onClick={() => handleCategoryChange(category.categoryId)}
            />
          ))}
        </Stack>
      )}

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
                {t("home.noProducts")}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {!isLoading && data && data.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={page}
            count={data.totalPages}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
