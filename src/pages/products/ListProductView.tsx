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
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
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
  const navigation = useNavigate();

  const [tableData, setTableData] = useState<GridRowsProp[]>([]);
  const { handleGetTableDataRequest, handleRemoveRequest, handlePostRequest } =
    useHttp();
  const [modalDeleteData, setModalDeleteData] = useState<IListProduct>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

  // Upload Excel State
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 1,
  });

  const handleDeleteCategory = async (productId: number) => {
    await handleRemoveRequest({
      path: `/products?productId=${productId}`,
    });
    await getTableData({ search: "" });
  };

  const handleOpenModalDelete = (data: IListProduct) => {
    setModalDeleteData(data);
    setOpenModalDelete(true);
  };

  const getTableData = async ({ search }: { search: string }) => {
    try {
      setLoading(true);
      const result = await handleGetTableDataRequest({
        path: "/products/admin",
        page: paginationModel.page ?? 1,
        size: paginationModel.pageSize ?? 10,
        filter: { search },
      });

      console.log(result);
      if (result) {
        setTableData(result.items);
        setRowCount(result.totalItems);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTableData({ search: "" });
  }, [paginationModel]);

  const handleUploadExcel = async () => {
    if (!uploadFile) return alert("Pilih file Excel terlebih dahulu!");
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);

      await handlePostRequest({
        path: "/products/upload-excel",
        body: formData,
      });

      setOpenUploadDialog(false);
      setUploadFile(null);
      await getTableData({ search: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "productCode",
      flex: 1,
      renderHeader: () => <strong>CODE</strong>,
    },
    {
      field: "productName",
      flex: 1,
      editable: true,
      renderHeader: () => <strong>NAMA</strong>,
    },
    {
      field: "productIsVisible",
      flex: 1,
      renderHeader: () => <strong>{"STATUS"}</strong>,
      editable: false,
      renderCell: (params) => {
        const status = params.value ? "visible" : "hidden";
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
      renderHeader: () => <strong>GAMBAR</strong>,
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
      renderHeader: () => <strong>HARGA</strong>,
      renderCell: (params) =>
        "Rp" + convertNumberToCurrency(params.row.variant?.productVariantPrice),
    },
    {
      field: "productVariantDiscount",
      flex: 1,
      headerName: "DISKON (%)",
      renderHeader: () => <strong>DISKON (%)</strong>,
      renderCell: (params) => params.row.variant?.productVariantDiscount + "%",
    },
    {
      field: "productSellPrice",
      flex: 1,
      renderHeader: () => <strong>HARGA JUAL</strong>,
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
    {
      field: "productStock",
      renderHeader: () => <strong>STOK</strong>,
      renderCell: (params) => params.row.variant?.productVariantStock,
    },
    {
      field: "productTotalSale",
      renderHeader: () => <strong>TERJUAL</strong>,
      renderCell: (params) => params.row.productTotalSale || 0,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>AKSI</strong>,
      flex: 2,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigation("edit/" + row.productId)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleOpenModalDelete(row)}
        />,
        <GridActionsCellItem
          icon={<MoreOutlined color="info" />}
          label="Detail"
          onClick={() => navigation("detail/" + row.productId)}
        />,
      ],
    },
  ];

  function CustomToolbar() {
    const [search, setSearch] = useState<string>("");
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
          <Button
            onClick={() => navigation("create")}
            startIcon={<Add />}
            variant="outlined"
          >
            Tambah Produk
          </Button>
          <Button
            onClick={() => navigation("uploads/histories")}
            startIcon={<UploadFile />}
            variant="outlined"
            color="secondary"
          >
            Upload
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            size="small"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outlined" onClick={() => getTableData({ search })}>
            Search
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
            label: "Product",
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
          sx={{ backgroundColor: "background.default", borderRadius: 2, p: 2 }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          rowCount={rowCount}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>

      {/* === Modal Delete === */}
      <Modal
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={`Apakah anda yakin ingin menghapus ${modalDeleteData?.productName}?`}
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
        <DialogTitle>Upload Produk via Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Silakan pilih file Excel (.xlsx atau .xls)
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
            Batal
          </Button>
          <Button
            onClick={handleUploadExcel}
            disabled={uploadLoading}
            variant="contained"
          >
            {uploadLoading ? "Mengunggah..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
