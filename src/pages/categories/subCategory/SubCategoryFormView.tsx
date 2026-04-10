import { useEffect, useState } from "react";
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
import { useHttp } from "../../../hooks/http";
import BreadCrumberStyle from "../../../components/breadcrumb/Index";
import { IconMenus } from "../../../components/icon";
import {
  subCategorySchema,
  SubCategoryFormValues,
} from "../../../validations/categorySchema";

interface SubCategoryFormViewProps {
  open?: boolean;
  categoryId?: string;
  categoryReference?: string;
  onClose?: () => void;
  onSuccess?: () => Promise<void> | void;
}

export default function SubCategoryFormView({
  open,
  categoryId: propsCategoryId,
  categoryReference: propsCategoryReference,
  onClose,
  onSuccess,
}: SubCategoryFormViewProps = {}) {
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
  const { handlePostRequest, handleGetRequest, handleUpdateRequest } =
    useHttp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      categoryName: "",
      categoryReference,
      categoryType: "child",
    },
  });

  const getCategory = async () => {
    try {
      const res = await handleGetRequest({
        path: `/categories/detail/${categoryId}`,
      });
      if (res) {
        reset({
          categoryId: res.categoryId,
          categoryName: res.categoryName,
          categoryReference,
          categoryType: "child",
        });
      }
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

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

    getCategory();
  }, [categoryId, categoryReference, isModalMode, open, reset]);

  const onSubmit = async (data: SubCategoryFormValues) => {
    setLoading(true);

    try {
      if (categoryId) {
        await handleUpdateRequest({
          path: `/categories`,
          body: { ...data, categoryId },
        });
      } else {
        await handlePostRequest({
          path: "/categories",
          body: data,
        });
      }

      if (isModalMode) {
        await onSuccess?.();
        onClose?.();
      } else {
        navigate(`/categories/subcategories/${categoryReference}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {categoryId ? "Edit Sub Kategori" : "Tambah Sub Kategori"}
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
            link: `/categories`,
            icon: <IconMenus.category fontSize="small" />,
          },
          {
            label: categoryId ? "Edit" : "Create",
            link: categoryId
              ? `/categories/subcategories/edit/${categoryId}/${categoryReference}`
              : "/categories/subcategories/create",
          },
        ]}
      />

      <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
          {categoryId ? "Edit Sub Kategori" : "Tambah Sub Kategori"}
        </Typography>
        {formContent}
      </Card>
    </>
  );
}
