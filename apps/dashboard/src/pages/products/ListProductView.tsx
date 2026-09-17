import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Add, MoreOutlined, UploadFile } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useProducts,
  useRemoveProduct,
  useUploadProductsExcel,
} from "../../services/products";
import {
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/modal";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";
import { getImageUrl } from "../../utilities/getImageUrl";
import { IListProduct } from "../../interfaces/Product";

export default function ProductListView() {
  const { t } = useTranslation();
  const navigation = useNavigate();

  const [modalDeleteData, setModalDeleteData] = useState<IListProduct>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

  // Upload Excel State
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 1,
  });

  const { data, isLoading } = useProducts({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const removeProduct = useRemoveProduct();
  const uploadExcel = useUploadProductsExcel();

  const handleDeleteCategory = (productId: number) => {
    removeProduct.mutate(productId);
  };

  const handleOpenModalDelete = (data: IListProduct) => {
    setModalDeleteData(data);
    setOpenModalDelete(true);
  };

  const handleUploadExcel = () => {
    if (!uploadFile) return alert(t("common.pickExcelFileAlert"));

    uploadExcel.mutate(uploadFile, {
      onSuccess: () => {
        setOpenUploadDialog(false);
        setUploadFile(null);
      },
    });
  };

  const columns: GridColDef[] = [
    {
      field: "productCode",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.code")}</strong>,
    },
    {
      field: "productName",
      flex: 1,
      editable: true,
      renderHeader: () => <strong>{t("product.column.name")}</strong>,
    },
    {
      field: "productIsVisible",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.status")}</strong>,
      editable: false,
      renderCell: (params) => {
        const status = params.value ? t("product.visible") : t("product.hidden");
        return (
          <Chip
            label={status}
            color={params.value ? "info" : "error"}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: "productImage",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.image")}</strong>,
      renderCell: (params) => (
        <img
          src={getImageUrl(params.row?.variant?.productVariantImage)}
          alt="image"
          style={{
            width: 50,
            height: 50,
            borderRadius: "6px",
            objectFit: "cover",
          }}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "productVariantPrice",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.price")}</strong>,
      renderCell: (params) =>
        "Rp" + convertNumberToCurrency(params.row.variant?.productVariantPrice),
    },
    {
      field: "productVariantDiscount",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.discount")}</strong>,
      renderCell: (params) => params.row.variant?.productVariantDiscount + "%",
    },
    {
      field: "productSellPrice",
      flex: 1,
      renderHeader: () => <strong>{t("product.column.finalPrice")}</strong>,
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
    {
      field: "productStock",
      renderHeader: () => <strong>{t("product.column.stock")}</strong>,
      renderCell: (params) => params.row.variant?.productVariantStock,
    },
    {
      field: "productTotalSale",
      renderHeader: () => <strong>{t("product.column.sold")}</strong>,
      renderCell: (params) => params.row.productTotalSale || 0,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{t("product.column.actions")}</strong>,
      flex: 2,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label={t("common.edit")}
          onClick={() => navigation("edit/" + row.productId)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label={t("common.delete")}
          onClick={() => handleOpenModalDelete(row)}
        />,
        <GridActionsCellItem
          icon={<MoreOutlined color="info" />}
          label={t("common.detail")}
          onClick={() => navigation("detail/" + row.productId)}
        />,
      ],
    },
  ];

  function CustomToolbar() {
    const [searchInput, setSearchInput] = useState<string>(search);
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
          <Button
            onClick={() => navigation("create")}
            startIcon={<Add />}
            variant="outlined"
          >
            {t("product.addProduct")}
          </Button>
          <Button
            onClick={() => navigation("uploads/histories")}
            startIcon={<UploadFile />}
            variant="outlined"
            color="secondary"
          >
            {t("common.upload")}
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            size="small"
            placeholder={t("common.search")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button variant="outlined" onClick={() => setSearch(searchInput)}>
            {t("common.searchButton")}
          </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("product.title"),
            link: "/products",
            icon: <IconMenus.products fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={tableData}
          getRowId={(row) => row.productId}
          columns={columns}
          autoHeight
          sx={{ backgroundColor: "background.paper", borderRadius: 2, p: 2 }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          rowCount={rowCount}
          loading={isLoading}
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>

      {/* === Modal Delete === */}
      <Modal
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={t("common.confirmDeleteNamed", { name: modalDeleteData?.productName })}
        handleModal={() => {
          handleDeleteCategory(modalDeleteData?.productId!);
          setOpenModalDelete(false);
        }}
      />

      {/* === Dialog Upload Excel (MUI) === */}
      <Dialog
        open={openUploadDialog}
        onClose={() => {
          setOpenUploadDialog(false);
          setUploadFile(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("product.uploadExcelTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t("product.chooseExcelFile")}
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) =>
              setUploadFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenUploadDialog(false);
              setUploadFile(null);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleUploadExcel}
            disabled={uploadExcel.isPending}
            variant="contained"
          >
            {uploadExcel.isPending ? t("product.uploading") : t("common.upload")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
