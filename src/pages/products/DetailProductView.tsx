import { useNavigate, useParams } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import type { IProduct } from "../../interfaces/Product";
import {
  getVariantsFromProduct,
  parseVariantPrice,
  sortVariantsByLowestPrice,
} from "../../utilities/productVariants";

function formatRp(value: number | string | undefined | null) {
  return "Rp" + convertNumberToCurrency(parseVariantPrice(value));
}

export default function DetailProductView() {
  const { handleGetRequest } = useHttp();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [productDetail, setProductDetail] = useState<IProduct | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/products");
  };

  const getDetailProduct = async () => {
    const result = (await handleGetRequest({
      path: "/products/detail/" + productId,
    })) as IProduct | undefined;
    if (result) {
      setProductDetail(result);
    }
  };

  useEffect(() => {
    getDetailProduct();
  }, [productId]);

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
        { label: "Nama", value: productDetail.productName },
        {
          label: "Deskripsi",
          value: productDetail.productDescription ?? "—",
        },
        { label: "CODE (SKU)", value: productDetail.productCode ?? "—" },
        { label: "Barcode", value: productDetail.productBarcode ?? "—" },
        { label: "Satuan", value: productDetail.productUnit ?? "—" },
        {
          label: "Status",
          value: (
            <Chip
              size="small"
              label={productDetail.productIsVisible ? "Visible" : "Hidden"}
              color={productDetail.productIsVisible ? "success" : "default"}
              variant="outlined"
            />
          ),
        },
        {
          label: "Kategori",
          value: productDetail.category?.categoryName ?? "—",
        },
        {
          label: "Subkategori (ID)",
          value: String(productDetail.productSubCategoryId ?? "—"),
        },
      ]
    : [];

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Product",
            link: "/products",
            icon: <IconMenus.products fontSize="small" />,
          },
          {
            label: "Detail",
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
            Kembali
          </Button>
        </Stack>

        {!productDetail ? (
          <Typography color="text.secondary">Memuat data…</Typography>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              {carouselImages.length > 0 ? (
                <Carousel dynamicHeight showThumbs={false}>
                  {carouselImages.map((image, index) => (
                    <div key={image + index}>
                      <img
                        src={getImageUrl(image)}
                        alt={`Varian ${index + 1}`}
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
                  Tidak ada gambar varian
                </Typography>
              )}
            </Box>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informasi produk
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
              Varian produk
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                fontWeight={400}
                sx={{ ml: 1 }}
              >
                (diurut dari harga terendah)
              </Typography>
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Gambar</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Nama</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Harga</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Harga jual</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Diskon %</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Stok</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Berat (g)</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Terjual</strong>
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
