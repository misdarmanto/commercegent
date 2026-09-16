import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
} from "../../services/products";
import { useCategoryOptions } from "../../services/categories";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import ButtonDeleteFile from "../../components/buttons/ButtonDeleteFile";
import {
  ProductFormValues,
  getProductFormCreateSchema,
  getProductFormUpdateSchema,
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
  const { t, i18n } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(productId);

  const { data: productDetail, isFetching: isLoadingProduct } =
    useProduct(productId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const loading =
    isLoadingProduct || createProduct.isPending || updateProduct.isPending;

  const resolver = useMemo(
    () =>
      zodResolver(
        isEdit ? getProductFormUpdateSchema() : getProductFormCreateSchema(),
      ) as any,
    // i18n.language forces the resolver to rebuild with fresh validation
    // messages when the user switches language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit, i18n.language],
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

  useEffect(() => {
    if (!productDetail) return;

    reset({
      productName: productDetail.productName,
      productDescription: productDetail.productDescription ?? "",
      productCategoryId: Number(productDetail.productCategoryId ?? 0),
      productSubCategoryId: productDetail.productSubCategoryId
        ? Number(productDetail.productSubCategoryId)
        : 0,
      productCode: productDetail.productCode ?? "",
      productBarcode: productDetail.productBarcode ?? "",
      productUnit: productDetail.productUnit ?? "pcs",
      productIsVisible: productDetail.productIsVisible ?? true,
      productVariants: mapApiToFormVariants(productDetail),
    });
  }, [productDetail, reset]);

  const selectedCategoryId = watch("productCategoryId");
  const { data: listCategory = [] } = useCategoryOptions({
    categoryType: "parent",
  });
  const { data: listSubCategory = [] } = useCategoryOptions({
    categoryType: "child",
    categoryReference: selectedCategoryId || undefined,
  });

  useEffect(() => {
    if (!selectedCategoryId || selectedCategoryId === 0) {
      setValue("productSubCategoryId", 0);
    }
  }, [selectedCategoryId, setValue]);

  const onSubmit = async (data: ProductFormValues) => {
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

        await updateProduct.mutateAsync(payload);
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

        await createProduct.mutateAsync(payload);
      }

      navigate("/products");
    } catch (error) {
      console.error("submit product error", error);
    }
  };

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
            label: productId ? t("common.edit") : t("common.add"),
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
            {t("product.form.back")}
          </Button>
        </Stack>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {productId ? t("product.form.editTitle") : t("product.form.createTitle")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography fontWeight="bold" mb={2}>
            {t("product.form.productInfo")}
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="productName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("product.form.name")}
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
                    label={t("product.form.sku")}
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
                    label={t("product.form.barcode")}
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
                    label={t("product.form.unit")}
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
                    label={t("product.form.visible")}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.productCategoryId}>
                <InputLabel id="category-select-label">{t("product.form.category")}</InputLabel>
                <Controller
                  name="productCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? 0}
                      labelId="category-select-label"
                      label={t("product.form.category")}
                    >
                      <MenuItem value={0}>{t("product.form.selectCategory")}</MenuItem>
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
                    {t("product.form.subCategory")}
                  </InputLabel>
                  <Controller
                    name="productSubCategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? 0}
                        labelId="subcategory-select-label"
                        label={t("product.form.subCategory")}
                      >
                        <MenuItem value={0}>{t("product.form.selectSubCategory")}</MenuItem>
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
              {t("product.form.description")}
            </Typography>
            <Controller
              name="productDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("product.form.description")}
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
            <Typography fontWeight="bold">{t("product.form.variants")}</Typography>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append(emptyVariant())}
            >
              {t("product.form.addVariant")}
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("product.form.variantsHint")}
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
                  {t("product.form.variant")} {index + 1}
                  {isEdit &&
                    watch(`productVariants.${index}.productVariantId`) !=
                      null && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({t("product.form.variantId")}:{" "}
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
                    aria-label={t("product.form.removeVariant")}
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
                        label={t("product.form.variantName")}
                        placeholder={t("product.form.variantNamePlaceholder")}
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
                        label={t("product.form.variantPrice")}
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
                        label={t("product.form.variantStock")}
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
                        label={t("product.form.variantDiscount")}
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
                        label={t("product.form.variantWeight")}
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
                    {t("product.form.variantImage")}
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
                  ? t("product.form.updating")
                  : t("product.form.submitting")
                : productId
                  ? t("product.form.update")
                  : t("product.form.submit")}
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
