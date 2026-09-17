import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Typography,
  Box,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../../../services/categories";
import BreadCrumberStyle from "../../../components/breadcrumb/Index";
import { IconMenus } from "../../../components/icon";
import {
  getSubCategorySchema,
  SubCategoryFormValues,
} from "../../../validations/categorySchema";
import type { ICategoryCreate } from "../../../interfaces/Category";

interface SubCategoryFormViewProps {
  open?: boolean;
  categoryId?: string;
  categoryReference?: string;
  onClose?: () => void;
}

export default function SubCategoryFormView({
  open,
  categoryId: propsCategoryId,
  categoryReference: propsCategoryReference,
  onClose,
}: SubCategoryFormViewProps = {}) {
  const { t } = useTranslation();
  const {
    categoryId: paramsCategoryId,
    categoryReference: paramsCategoryReference,
  } = useParams<{
    categoryId: string;
    categoryReference: string;
  }>();
  const isModalMode = typeof open === "boolean";
  const categoryId = propsCategoryId ?? paramsCategoryId;
  const categoryReference = propsCategoryReference ?? paramsCategoryReference;
  const navigate = useNavigate();

  const shouldFetch = categoryId != null && (!isModalMode || open === true);
  const { data: category } = useCategory(shouldFetch ? categoryId : undefined);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const loading = createCategory.isPending || updateCategory.isPending;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(getSubCategorySchema()),
    defaultValues: {
      categoryName: "",
      categoryReference,
      categoryType: "child",
    },
  });

  useEffect(() => {
    if (isModalMode && !open) return;

    if (!categoryReference) return;

    if (!categoryId) {
      reset({
        categoryName: "",
        categoryReference,
        categoryType: "child",
      });
      return;
    }

    if (category) {
      reset({
        categoryId: Number(category.categoryId),
        categoryName: category.categoryName,
        categoryReference,
        categoryType: "child",
      });
    }
  }, [category, categoryId, categoryReference, isModalMode, open, reset]);

  const onSubmit = async (data: SubCategoryFormValues) => {
    try {
      if (categoryId) {
        await updateCategory.mutateAsync({
          ...data,
          categoryId,
        } as Partial<ICategoryCreate> & { categoryId: string });
      } else {
        await createCategory.mutateAsync(data as ICategoryCreate);
      }

      if (isModalMode) {
        onClose?.();
      } else {
        navigate(`/categories/subcategories/${categoryReference}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const formContent = (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Controller
          name="categoryName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("category.form.name")}
              fullWidth
              error={!!errors.categoryName}
              helperText={errors.categoryName?.message}
            />
          )}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          {isModalMode && (
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              {t("category.form.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ width: "25ch", fontWeight: "bold" }}
          >
            {loading
              ? categoryId
                ? t("category.form.updating")
                : t("category.form.submitting")
              : categoryId
                ? t("category.form.update")
                : t("category.form.submit")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );

  if (isModalMode) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {categoryId ? t("category.form.editSubTitle") : t("category.form.createSubTitle")}
        </DialogTitle>
        <DialogContent dividers>{formContent}</DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("category.title"),
            link: `/categories`,
            icon: <IconMenus.category fontSize="small" />,
          },
          {
            label: categoryId ? t("common.edit") : t("common.add"),
            link: categoryId
              ? `/categories/subcategories/edit/${categoryId}/${categoryReference}`
              : "/categories/subcategories/create",
          },
        ]}
      />

      <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {categoryId ? t("category.form.editSubTitle") : t("category.form.createSubTitle")}
        </Typography>
        {formContent}
      </Card>
    </>
  );
}
