import { useEffect, useState } from "react";
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
  categorySchema,
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
    resolver: zodResolver(categorySchema),
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
              label="Nama Kategori"
              fullWidth
              error={!!errors.categoryName}
              helperText={errors.categoryName?.message}
            />
          )}
        />

        <Box>
          <Typography color="text.secondary" mb={1}>
            Icon Kategori (512x512 px, maks 2MB)
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
                <FormHelperText>Upload ikon kategori.</FormHelperText>
              </Stack>
            )}
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          {isModalMode && (
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              Batal
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
                ? "Updating..."
                : "Submitting..."
              : categoryId
                ? "Update"
                : "Submit"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );

  if (isModalMode) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {categoryId ? "Edit Kategori" : "Tambah Kategori"}
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
            label: "Category",
            link: "/categories",
            icon: <IconMenus.category fontSize="small" />,
          },
          {
            label: categoryId ? "Edit" : "Create",
            link: categoryId
              ? `/categories/edit/${categoryId}`
              : "/categories/create",
          },
        ]}
      />

      <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {categoryId ? "Edit Kategori" : "Tambah Kategori"}
        </Typography>
        {formContent}
      </Card>
    </>
  );
}
