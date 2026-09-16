import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "../../services/products";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";
import { getImageUrl } from "../../utilities/getImageUrl";
import {
  getVariantsFromProduct,
  parseVariantPrice,
  sortVariantsByLowestPrice,
} from "../../utilities/productVariants";

function formatRp(value: number | string | undefined | null) {
  return "Rp" + convertNumberToCurrency(parseVariantPrice(value));
}

export default function DetailProductView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data: productDetail } = useProduct(productId);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/products");
  };

  const sortedVariants = useMemo(() => {
    if (!productDetail) return [];
    return sortVariantsByLowestPrice(getVariantsFromProduct(productDetail));
  }, [productDetail]);

  const carouselImages = useMemo(() => {
    const urls = sortedVariants
      .map((v) => v.productVariantImage)
      .filter((u): u is string => Boolean(u?.trim()));
    return [...new Set(urls)];
  }, [sortedVariants]);

  const infoRows: { label: string; value: ReactNode }[] = productDetail
    ? [
        { label: t("product.detail.name"), value: productDetail.productName },
        {
          label: t("product.detail.description"),
          value: productDetail.productDescription ?? "—",
        },
        { label: t("product.detail.code"), value: productDetail.productCode ?? "—" },
        { label: t("product.detail.barcode"), value: productDetail.productBarcode ?? "—" },
        { label: t("product.detail.unit"), value: productDetail.productUnit ?? "—" },
        {
          label: t("product.detail.status"),
          value: (
            <Chip
              size="small"
              label={productDetail.productIsVisible ? t("product.visible") : t("product.hidden")}
              color={productDetail.productIsVisible ? "success" : "default"}
              variant="outlined"
            />
          ),
        },
        {
          label: t("product.detail.category"),
          value: productDetail.category?.categoryName ?? "—",
        },
        {
          label: t("product.detail.subCategoryId"),
          value: String(productDetail.productSubCategoryId ?? "—"),
        },
      ]
    : [];

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("product.title"),
            link: "/products",
            icon: <IconMenus.products fontSize="small" />,
          },
          {
            label: t("common.detail"),
            link: "/products/detail/" + productId,
          },
        ]}
      />
      <Card sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            {t("product.detail.back")}
          </Button>
        </Stack>

        {!productDetail ? (
          <Typography color="text.secondary">{t("product.detail.loading")}</Typography>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              {carouselImages.length > 0 ? (
                <Carousel dynamicHeight showThumbs={false}>
                  {carouselImages.map((image, index) => (
                    <div key={image + index}>
                      <img
                        src={getImageUrl(image)}
                        alt={`${t("product.detail.variantAlt")} ${index + 1}`}
                        style={{
                          maxHeight: "400px",
                          width: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <Typography color="text.secondary" align="center" py={4}>
                  {t("product.detail.noVariantImage")}
                </Typography>
              )}
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t("product.detail.productInfo")}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {infoRows.map((row) => (
                <Grid item xs={12} key={row.label}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "baseline" }}
                  >
                    <Typography
                      component="span"
                      fontWeight="bold"
                      sx={{ minWidth: { sm: 160 } }}
                    >
                      {row.label}
                    </Typography>
                    <Typography component="span" color="text.secondary">
                      :
                    </Typography>
                    <Box>{row.value}</Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t("product.detail.variants")}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                fontWeight={400}
                sx={{ ml: 1 }}
              >
                {t("product.detail.sortedByLowestPrice")}
              </Typography>
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{t("product.detail.table.image")}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{t("product.detail.table.name")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.price")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.sellPrice")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.discount")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.stock")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.weight")}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{t("product.detail.table.sold")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedVariants.map((v) => (
                    <TableRow key={v.productVariantId ?? v.productVariantName}>
                      <TableCell>
                        {v.productVariantImage ? (
                          <img
                            src={getImageUrl(v.productVariantImage)}
                            alt=""
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 6,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{v.productVariantName}</TableCell>
                      <TableCell align="right">
                        {formatRp(v.productVariantPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatRp(v.productVariantSellPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {v.productVariantDiscount ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {v.productVariantStock ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {v.productVariantWeight ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {v.productVariantTotalSale ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Card>
    </>
  );
}
