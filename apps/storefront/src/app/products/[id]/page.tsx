"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useProduct } from "@/lib/api/products";
import { useAddToCart } from "@/lib/api/cart";
import { getImageUrl } from "@/lib/utils/getImageUrl";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLoggedIn } from "@/lib/auth/token";
import { RelatedProducts } from "@/components/product/RelatedProducts";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useAddToCart();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => v.productVariantId === selectedVariantId) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedVariantId]);

  if (isLoading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography align="center">{t("product.notFound")}</Typography>
      </Container>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (!selectedVariant) return;
    addToCart.mutate({
      cartProductId: product.productId,
      cartProductVariantId: selectedVariant.productVariantId,
      cartQuantity: quantity,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            component="img"
            src={getImageUrl(selectedVariant?.productVariantImage)}
            alt={product.productName}
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: 3,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
            {product.productName}
          </Typography>

          {product.category && (
            <Chip label={product.category.categoryName} size="small" sx={{ mb: 2 }} />
          )}

          {selectedVariant && (
            <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}>
              {formatCurrency(selectedVariant.productVariantSellPrice)}
            </Typography>
          )}

          {product.productDescription && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {product.productDescription}
            </Typography>
          )}

          {product.variants.length > 1 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}
            >
              {product.variants.map((variant) => (
                <Chip
                  key={variant.productVariantId}
                  label={variant.productVariantName}
                  onClick={() => setSelectedVariantId(variant.productVariantId)}
                  color={
                    selectedVariant?.productVariantId === variant.productVariantId
                      ? "primary"
                      : "default"
                  }
                  variant={
                    selectedVariant?.productVariantId === variant.productVariantId
                      ? "filled"
                      : "outlined"
                  }
                />
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
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
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ px: 2 }}>{quantity}</Typography>
              <IconButton
                size="small"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {t("product.stock")}: {selectedVariant?.productVariantStock ?? 0}
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            disabled={
              !selectedVariant ||
              selectedVariant.productVariantStock <= 0 ||
              addToCart.isPending
            }
            onClick={handleAddToCart}
          >
            {addToCart.isPending ? t("product.adding") : t("product.addToCart")}
          </Button>
        </Grid>
      </Grid>

      <RelatedProducts
        categoryId={product.productCategoryId}
        excludeProductId={product.productId}
      />
    </Container>
  );
}
