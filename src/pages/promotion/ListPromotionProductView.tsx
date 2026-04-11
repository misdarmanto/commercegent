import Box from "@mui/material/Box";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
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
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";
import { getImageUrl } from "../../utilities/getImageUrl";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export default function ListProductPromotionView() {
  const {
    handleGetTableDataRequest,
    handleRemoveRequest,
    handleUpdateRequest,
  } = useHttp();

  /** ================== STATE ================== */
  const [tableData, setTableData] = useState<GridRowsProp[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  // highlight modal
  const [openHighlightModal, setOpenHighlightModal] = useState(false);
  const [productHighlightRows, setProductHighlightRows] = useState<
    GridRowsProp[]
  >([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [highlightPaginationModel, setHighlightPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [highlightRowCount, setHighlightRowCount] = useState(0);

  /** ================== API ================== */
  const getTableData = async ({ search }: { search: string }) => {
    try {
      setLoading(true);
      const result = await handleGetTableDataRequest({
        path: "/promotions",
        page: paginationModel.page,
        size: paginationModel.pageSize,
        filter: { search },
      });

      if (result) {
        setTableData(result.items);
        setRowCount(result.total_items);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromotion = async (productId: number) => {
    try {
      await handleRemoveRequest({
        path: "/promotions?productId=" + productId,
      });

      await getTableData({ search: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveHighlight = async () => {
    if (selectedProductIds.length === 0) {
      alert("Pilih minimal 1 produk");
      return;
    }

    try {
      setHighlightLoading(true);

      await handleUpdateRequest({
        path: "/promotions",
        body: {
          products: selectedProductIds.map((id) => ({
            productId: id,
            productIsHighlight: true,
          })),
        },
      });

      setOpenHighlightModal(false);
      setSelectedProductIds([]);
      await getTableData({ search: "" });
    } finally {
      setHighlightLoading(false);
    }
  };

  /** ================== EFFECT ================== */
  useEffect(() => {
    getTableData({ search: "" });
  }, [paginationModel]);

  useEffect(() => {
    if (!openHighlightModal) return;

    const load = async () => {
      try {
        setHighlightLoading(true);
        const result = await handleGetTableDataRequest({
          path: "/products",
          page: highlightPaginationModel.page + 1,
          size: highlightPaginationModel.pageSize,
          filter: { productIsHighlight: false },
        });

        if (result) {
          setProductHighlightRows(result.items);
          setHighlightRowCount(result.totalItems ?? result.total_items ?? 0);
        }
      } finally {
        setHighlightLoading(false);
      }
    };

    void load();
  }, [openHighlightModal, highlightPaginationModel]);

  /** ================== COLUMNS ================== */
  const columns: GridColDef[] = [
    {
      field: "productName",
      flex: 1,
      headerName: "NAMA",
      renderHeader: () => <strong>NAMA</strong>,
      renderCell: (params) => params.row.productName,
    },
    {
      field: "productCode",
      flex: 1,
      headerName: "BARCODE",
      renderHeader: () => <strong>BARCODE</strong>,
      renderCell: (params) => params.row.productCode,
    },
    {
      field: "productImage",
      headerName: "GAMBAR",
      renderHeader: () => <strong>GAMBAR</strong>,
      renderCell: (params) => (
        <img
          src={getImageUrl(params.row?.variant?.productVariantImage)}
          style={{ width: 50, height: 50, borderRadius: 6 }}
        />
      ),
    },
    {
      field: "productSellPrice",
      flex: 1,
      headerName: "HARGA",
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
    {
      field: "productDiscount",
      flex: 1,
      headerName: "DISKON (%)",
      renderCell: (params) => params.row.variant?.productVariantDiscount + "%",
    },

    {
      field: "productStock",
      flex: 1,
      headerName: "STOK",
      renderCell: (params) => params.row.variant?.productVariantStock,
    },
    {
      field: "productTotalSale",
      flex: 1,
      headerName: "TERJUAL",
      renderCell: (params) => params.row.productTotalSale || 0,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>AKSI</strong>,
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<HighlightOffIcon color="warning" />}
          label="Remove Promotion"
          onClick={() => handleRemovePromotion(row.productId)}
          showInMenu
        />,
      ],
    },
  ];

  const highlightColumns: GridColDef[] = [
    {
      field: "select",
      width: 70,
      renderHeader: () => <strong>PILIH</strong>,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={selectedProductIds.includes(params.row.productId)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProductIds((prev) => [...prev, params.row.productId]);
            } else {
              setSelectedProductIds((prev) =>
                prev.filter((id) => id !== params.row.productId),
              );
            }
          }}
        />
      ),
    },
    {
      field: "productImage",
      renderHeader: () => <strong>GAMBAR</strong>,
      renderCell: (params) => (
        <img
          src={getImageUrl(params.row?.variant?.productVariantImage)}
          style={{ width: 50, height: 50, borderRadius: 6 }}
        />
      ),
    },
    {
      field: "productName",
      flex: 1,
      headerName: "Nama Produk",
      renderHeader: () => <strong>NAMA</strong>,
      renderCell: (params) => params.row.productName,
    },
    {
      field: "productCode",
      flex: 1,
      headerName: "CODE",
      renderHeader: () => <strong>CODE</strong>,
      renderCell: (params) => params.row.productCode,
    },
    {
      field: "productSellPrice",
      flex: 1,
      headerName: "Harga",
      renderHeader: () => <strong>HARGA</strong>,
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
  ];

  function CustomToolbar() {
    const [search, setSearch] = useState("");
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            setHighlightPaginationModel((prev) => ({ ...prev, page: 0 }));
            setOpenHighlightModal(true);
          }}
        >
          Tambah Produk
        </Button>

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => getTableData({ search })}>Search</Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Promotion",
            link: "/promotions",
            icon: <IconMenus.promotion fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={tableData}
          getRowId={(row) => row.productId}
          columns={columns}
          sx={{ backgroundColor: "white", borderRadius: 2, p: 2 }}
          autoHeight
          loading={loading}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          slots={{ toolbar: CustomToolbar }}
        />
      </Box>

      {/* HIGHLIGHT MODAL */}
      <Dialog open={openHighlightModal} maxWidth="md" fullWidth>
        <DialogTitle>Pilih Produk Highlight</DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%", minHeight: 420 }}>
            <DataGrid
              rows={productHighlightRows}
              getRowId={(row) => row.productId}
              columns={highlightColumns}
              loading={highlightLoading}
              paginationMode="server"
              rowCount={highlightRowCount}
              paginationModel={highlightPaginationModel}
              onPaginationModelChange={setHighlightPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHighlightModal(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveHighlight}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
