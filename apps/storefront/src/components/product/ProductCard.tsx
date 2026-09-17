import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import { IProductListItem } from "@/interfaces/Product";
import { getImageUrl } from "@/lib/utils/getImageUrl";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export function ProductCard({ product }: { product: IProductListItem }) {
  const { t } = useTranslation();
  const variant = product.variant;
  const outOfStock = product.productTotalStock <= 0;

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        component={Link}
        href={`/products/${product.productId}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardMedia
          component="img"
          image={getImageUrl(variant?.productVariantImage)}
          alt={product.productName}
          sx={{ aspectRatio: "1 / 1", objectFit: "cover" }}
        />
        <CardContent>
          <Typography variant="subtitle2" noWrap title={product.productName}>
            {product.productName}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
              {formatCurrency(variant?.productVariantSellPrice)}
            </Typography>
            {variant && variant.productVariantDiscount > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatCurrency(variant.productVariantPrice)}
              </Typography>
            )}
          </Stack>
          {outOfStock && (
            <Chip
              label={t("product.outOfStock")}
              size="small"
              color="default"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
