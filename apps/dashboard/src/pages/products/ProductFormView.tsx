import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Typography,
  Box,
  TextField,
  Stack,
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack, Add as AddIcon, DeleteOutline } from "@mui/icons-material";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHttp } from "../../hooks/http";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import ButtonDeleteFile from "../../components/buttons/ButtonDeleteFile";
import {
  ProductFormValues,
  productFormCreateSchema,
  productFormUpdateSchema,
} from "../../validations/productSchema";
import {
  IProduct,
  IProductCreate,
  IProductUpdate,
} from "../../interfaces/Product";
import {
  getVariantsFromProduct,
  parseVariantPrice,
} from "../../utilities/productVariants";
import ButtonUploadWithOption from "../../components/buttons/ButtonUploadWithOption";
import { Checkbox, FormControlLabel } from "@mui/material";
import { ICategory } from "../../interfaces/Category";

const emptyVariant = (): ProductFormValues["productVariants"][number] => ({
  productVariantId: undefined,
  productVariantName: "",
  productVariantImage: "",
  productVariantPrice: 0,
  productVariantStock: 0,
  productVariantDiscount: 0,
  productVariantWeight: 0,
});

export default function ProductFormView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { handlePostRequest, handleUpdateRequest, handleGetRequest } =
    useHttp();

  const [listCategory, setListCategory] = useState<ICategory[]>([]);
  const [listSubCategory, setListSubCategory] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(productId);

  const resolver = useMemo(
    () =>
      zodResolver(
        isEdit ? productFormUpdateSchema : productFormCreateSchema,
      ) as any,
    [isEdit],
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver,
    defaultValues: {
      productName: "",
      productDescription: "",
      productCategoryId: 0,
      productSubCategoryId: 0,
      productCode: "",
      productBarcode: "",
      productUnit: "pcs",
      productIsVisible: true,
      productVariants: [emptyVariant()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productVariants",
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/products");
  };

  const getCategories = async () => {
    try {
      const res = await handleGetRequest({
        path: "/categories?categoryType=parent",
      });
      setListCategory(res?.items || []);
    } catch (err) {
      console.error("fetch categories error", err);
    }
  };

  const getSubCategories = async (categoryReference: number) => {
    try {
      const res = await handleGetRequest({
        path: `/categories?categoryType=child&categoryReference=${categoryReference}`,
      });
      setListSubCategory(res?.items || []);
    } catch (err) {
      console.error("fetch subcategories error", err);
    }
  };

  const mapApiToFormVariants = (
    res: IProduct,
  ): ProductFormValues["productVariants"] => {
    const list = getVariantsFromProduct(res);
    if (list.length > 0) {
      return list.map((v) => ({
        productVariantId: v.productVariantId,
        productVariantName: v.productVariantName,
        productVariantImage: v.productVariantImage ?? "",
        productVariantPrice: parseVariantPrice(v.productVariantPrice),
        productVariantStock: Number(v.productVariantStock ?? 0),
        productVariantDiscount: Number(v.productVariantDiscount ?? 0),
        productVariantWeight: Number(v.productVariantWeight ?? 0),
      }));
    }
    return [
      {
        productVariantName: "Default",
        productVariantImage: res.productImages?.[0] ?? "",
        productVariantPrice: res.productPrice ?? 0,
        productVariantStock: res.productStock ?? 0,
        productVariantDiscount: res.productDiscount ?? 0,
        productVariantWeight: res.productWeight ?? 0,
      },
    ];
  };

  const getDetailProducts = async () => {
    try {
      setLoading(true);
      const res: IProduct = await handleGetRequest({
        path: `/products/detail/${productId}`,
      });

      if (res) {
        if (res.productCategoryId) {
          await getSubCategories(Number(res.productCategoryId));
        }

        reset({
          productName: res.productName,
          productDescription: res.productDescription ?? "",
          productCategoryId: Number(res.productCategoryId ?? 0),
          productSubCategoryId: res.productSubCategoryId
            ? Number(res.productSubCategoryId)
            : 0,
          productCode: res.productCode ?? "",
          productBarcode: res.productBarcode ?? "",
          productUnit: res.productUnit ?? "pcs",
          productIsVisible: res.productIsVisible ?? true,
          productVariants: mapApiToFormVariants(res),
        });
      }
    } catch (err) {
      console.error("fetch product error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (!productId) return;
    getDetailProducts();
  }, [productId, reset]);

  const selectedCategoryId = watch("productCategoryId");
  useEffect(() => {
    if (!selectedCategoryId || selectedCategoryId === 0) {
      setListSubCategory([]);
      setValue("productSubCategoryId", 0);
      return;
    }

    getSubCategories(Number(selectedCategoryId));
  }, [selectedCategoryId, setValue]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      if (productId) {
        const payload: IProductUpdate = {
          productId: Number(productId),
          productName: data.productName,
          productDescription: data.productDescription || "",
          productCategoryId: data.productCategoryId,
          productSubCategoryId: data.productSubCategoryId,
          productCode: data.productCode,
          productBarcode: data.productBarcode,
          productUnit: data.productUnit,
          productIsVisible: data.productIsVisible ?? true,
          productVariants: data.productVariants.map((v) => {
            const row: IProductUpdate["productVariants"][number] = {
              productVariantName: v.productVariantName,
              productVariantPrice: v.productVariantPrice,
              productVariantStock: v.productVariantStock,
              productVariantDiscount: v.productVariantDiscount,
            };
            if (v.productVariantId != null) {
              row.productVariantId = v.productVariantId;
            }
            if (v.productVariantImage?.trim()) {
              row.productVariantImage = v.productVariantImage.trim();
            }
            if (
              v.productVariantWeight != null &&
              !Number.isNaN(v.productVariantWeight)
            ) {
              row.productVariantWeight = v.productVariantWeight;
            }
            return row;
          }),
        };

        await handleUpdateRequest({ path: "/products", body: payload });
      } else {
        const payload: IProductCreate = {
          productName: data.productName,
          productDescription: data.productDescription,
          productCategoryId: data.productCategoryId,
          productSubCategoryId: data.productSubCategoryId,
          productCode: data.productCode,
          productBarcode: data.productBarcode,
          productUnit: data.productUnit,
          productIsVisible: data.productIsVisible ?? true,
          productVariants: data.productVariants.map((v) => ({
            productVariantName: v.productVariantName,
            productVariantImage: v.productVariantImage!.trim(),
            productVariantPrice: v.productVariantPrice,
            productVariantStock: v.productVariantStock,
            productVariantDiscount: v.productVariantDiscount,
            productVariantWeight: v.productVariantWeight!,
          })),
        };

        await handlePostRequest({ path: "/products", body: payload });
      }

      navigate("/products");
    } catch (error) {
      console.error("submit product error", error);
    } finally {
      setLoading(false);
    }
  };

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
            label: productId ? "Edit" : "Create",
            link: productId
              ? `/products/edit/${productId}`
              : "/products/create",
          },
        ]}
      />

      <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
        <Stack direction="row" justifyContent="flex-start" mb={2} spacing={2}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            size="small"
            onClick={handleBack}
          >
            Kembali
          </Button>
        </Stack>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {productId ? "Edit Product" : "Tambah Product"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography fontWeight="bold" mb={2}>
            Informasi produk
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nama Produk"
                    fullWidth
                    error={!!errors.productName}
                    helperText={errors.productName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="productCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Code (SKU)"
                    fullWidth
                    error={!!errors.productCode}
                    helperText={errors.productCode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="productBarcode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Barcode Produk"
                    fullWidth
                    error={!!errors.productBarcode}
                    helperText={errors.productBarcode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="productUnit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Satuan (pcs, kg, box)"
                    fullWidth
                    error={!!errors.productUnit}
                    helperText={errors.productUnit?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="productIsVisible"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Tampilkan produk ke publik"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.productCategoryId}>
                <InputLabel id="category-select-label">Kategori</InputLabel>
                <Controller
                  name="productCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? 0}
                      labelId="category-select-label"
                      label="Kategori"
                    >
                      <MenuItem value={0}>Pilih kategori</MenuItem>
                      {listCategory.map((c) => (
                        <MenuItem
                          key={c.categoryId}
                          value={Number(c.categoryId)}
                        >
                          {c.categoryName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>
                  {errors.productCategoryId?.message as string}
                </FormHelperText>
              </FormControl>
            </Grid>

            {listSubCategory.length > 0 && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.productSubCategoryId}>
                  <InputLabel id="subcategory-select-label">
                    Subkategori
                  </InputLabel>
                  <Controller
                    name="productSubCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? 0}
                        labelId="subcategory-select-label"
                        label="Subkategori"
                      >
                        <MenuItem value={0}>Pilih subkategori</MenuItem>
                        {listSubCategory.map((sub) => (
                          <MenuItem
                            key={sub.categoryId}
                            value={Number(sub.categoryId)}
                          >
                            {sub.categoryName}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.productSubCategoryId?.message as string}
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mb: 4 }}>
            <Typography fontWeight="bold" mb={2}>
              Deskripsi
            </Typography>
            <Controller
              name="productDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Deskripsi"
                  multiline
                  fullWidth
                  rows={4}
                  error={!!errors.productDescription}
                  helperText={errors.productDescription?.message}
                />
              )}
            />
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography fontWeight="bold">Varian produk</Typography>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append(emptyVariant())}
            >
              Tambah varian
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Harga, stok, diskon, dan gambar diatur per varian (warna / ukuran).
          </Typography>

          {fields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography fontWeight={600}>
                  Varian {index + 1}
                  {isEdit &&
                    watch(`productVariants.${index}.productVariantId`) !=
                      null && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        (ID:{" "}
                        {watch(`productVariants.${index}.productVariantId`)})
                      </Typography>
                    )}
                </Typography>
                {fields.length > 1 && (
                  <IconButton
                    type="button"
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    aria-label="Hapus varian"
                  >
                    <DeleteOutline />
                  </IconButton>
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`productVariants.${index}.productVariantName`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Nama varian"
                        placeholder="Contoh: Hitam - M"
                        fullWidth
                        error={
                          !!errors.productVariants?.[index]?.productVariantName
                        }
                        helperText={
                          errors.productVariants?.[index]?.productVariantName
                            ?.message
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`productVariants.${index}.productVariantPrice`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Harga"
                        fullWidth
                        type="number"
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        error={
                          !!errors.productVariants?.[index]?.productVariantPrice
                        }
                        helperText={
                          errors.productVariants?.[index]?.productVariantPrice
                            ?.message
                        }
                        inputProps={{ inputMode: "numeric" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`productVariants.${index}.productVariantStock`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Stok"
                        fullWidth
                        type="number"
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        error={
                          !!errors.productVariants?.[index]?.productVariantStock
                        }
                        helperText={
                          errors.productVariants?.[index]?.productVariantStock
                            ?.message
                        }
                        inputProps={{ inputMode: "numeric" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`productVariants.${index}.productVariantDiscount`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Diskon (%)"
                        fullWidth
                        type="number"
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        error={
                          !!errors.productVariants?.[index]
                            ?.productVariantDiscount
                        }
                        helperText={
                          errors.productVariants?.[index]
                            ?.productVariantDiscount?.message
                        }
                        inputProps={{ inputMode: "numeric" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`productVariants.${index}.productVariantWeight`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        label="Berat (gram)"
                        fullWidth
                        type="number"
                        value={f.value ?? ""}
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        error={
                          !!errors.productVariants?.[index]
                            ?.productVariantWeight
                        }
                        helperText={
                          errors.productVariants?.[index]?.productVariantWeight
                            ?.message
                        }
                        inputProps={{ inputMode: "numeric" }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography color="text.secondary" mb={1}>
                    Gambar varian (600×600 px, maks 2MB)
                  </Typography>
                  <Controller
                    name={`productVariants.${index}.productVariantImage`}
                    control={control}
                    render={({ field: f }) => (
                      <Box>
                        {!f.value ? (
                          <ButtonUploadWithOption
                            onUpload={(img) => f.onChange(img)}
                          />
                        ) : (
                          <Stack spacing={1} alignItems="flex-start">
                            <img
                              src={getImageUrl(f.value)}
                              alt="preview"
                              style={{
                                width: 160,
                                height: 160,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                            <ButtonDeleteFile
                              filename={f.value}
                              onDelete={() => f.onChange("")}
                            />
                          </Stack>
                        )}
                        <FormHelperText
                          error={
                            !!errors.productVariants?.[index]
                              ?.productVariantImage
                          }
                        >
                          {
                            errors.productVariants?.[index]?.productVariantImage
                              ?.message as string
                          }
                        </FormHelperText>
                      </Box>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              sx={{ my: 1, width: "25ch", fontWeight: "bold" }}
              variant="contained"
              disabled={loading}
            >
              {loading
                ? productId
                  ? "Updating..."
                  : "Submitting..."
                : productId
                  ? "Update"
                  : "Submit"}
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
