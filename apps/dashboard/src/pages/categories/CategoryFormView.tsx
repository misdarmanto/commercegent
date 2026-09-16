import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "../../services/categories";
import {
  Button,
  Card,
  Typography,
  Box,
  TextField,
  Stack,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import ButtonDeleteFile from "../../components/buttons/ButtonDeleteFile";
import {
  getCategorySchema,
  CategoryFormValues,
} from "../../validations/categorySchema";
import ButtonUploadWithOption from "../../components/buttons/ButtonUploadWithOption";
import type { ICategoryCreate } from "../../interfaces/Category";

interface CategoryFormViewProps {
  open?: boolean;
  categoryId?: string;
  onClose?: () => void;
}

export default function CategoryFormView({
  open,
  categoryId: propsCategoryId,
  onClose,
}: CategoryFormViewProps = {}) {
  const { t } = useTranslation();
  const { categoryId: paramsCategoryId } = useParams<{ categoryId: string }>();
  const isModalMode = typeof open === "boolean";
  const categoryId = propsCategoryId ?? paramsCategoryId;
  const navigate = useNavigate();
  const [categoryIcon, setCategoryIcon] = useState<string>("");

  const shouldFetch = categoryId != null && (!isModalMode || open === true);
  const { data: category } = useCategory(shouldFetch ? categoryId : undefined);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const loading = createCategory.isPending || updateCategory.isPending;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(getCategorySchema()),
    defaultValues: {
      categoryName: "",
      categoryIcon: "",
      categoryType: "parent",
    },
  });

  useEffect(() => {
    if (isModalMode && !open) return;

    if (!categoryId) {
      reset({
        categoryName: "",
        categoryIcon: "",
        categoryType: "parent",
      });
      setCategoryIcon("");
      return;
    }

    if (category) {
      reset({
        categoryName: category.categoryName,
        categoryIcon: category.categoryIcon,
        categoryType: "parent",
      });
      setCategoryIcon(category.categoryIcon || "");
    }
  }, [category, categoryId, isModalMode, open, reset]);

  useEffect(() => {
    setValue("categoryIcon", categoryIcon);
  }, [categoryIcon, setValue]);

  const onSubmit = async (data: CategoryFormValues) => {
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
        navigate("/categories");
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

        <Box>
          <Typography color="text.secondary" mb={1}>
            {t("category.form.iconHint")}
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={2}
            alignItems="center"
          >
            {categoryIcon && (
              <Stack spacing={1} alignItems="center">
                <img
                  src={getImageUrl(categoryIcon)}
                  alt="category icon"
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <ButtonDeleteFile
                  filename={categoryIcon}
                  onDelete={() => setCategoryIcon("")}
                />
              </Stack>
            )}

            {!categoryIcon && (
              <Stack alignItems="center">
                <ButtonUploadWithOption
                  onUpload={(image) => setCategoryIcon(image)}
                />
                <FormHelperText>{t("category.form.uploadIconHint")}</FormHelperText>
              </Stack>
            )}
          </Stack>
        </Box>

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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {categoryId ? t("category.form.editTitle") : t("category.form.createTitle")}
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
            link: "/categories",
            icon: <IconMenus.category fontSize="small" />,
          },
          {
            label: categoryId ? t("common.edit") : t("common.add"),
            link: categoryId
              ? `/categories/edit/${categoryId}`
              : "/categories/create",
          },
        ]}
      />

      <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {categoryId ? t("category.form.editTitle") : t("category.form.createTitle")}
        </Typography>
        {formContent}
      </Card>
    </>
  );
}
