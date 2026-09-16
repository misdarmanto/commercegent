import Box from "@mui/material/Box";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  usePromotions,
  useHighlightCandidates,
  useRemovePromotion,
  useSetHighlightedProducts,
} from "../../services/promotions";
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
  const { t } = useTranslation();
  /** ================== STATE ================== */
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  // highlight modal
  const [openHighlightModal, setOpenHighlightModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [highlightPaginationModel, setHighlightPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  /** ================== API ================== */
  const { data, isLoading: loading } = usePromotions({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const { data: highlightData, isLoading: highlightLoading } =
    useHighlightCandidates(
      {
        page: highlightPaginationModel.page + 1,
        size: highlightPaginationModel.pageSize,
      },
      { enabled: openHighlightModal },
    );
  const productHighlightRows: GridRowsProp = highlightData?.items ?? [];
  const highlightRowCount = highlightData?.totalItems ?? 0;

  const removePromotion = useRemovePromotion();
  const setHighlighted = useSetHighlightedProducts();

  const handleRemovePromotion = (productId: number) => {
    removePromotion.mutate(productId);
  };

  const handleSaveHighlight = () => {
    if (selectedProductIds.length === 0) {
      alert(t("promotion.selectMinOneAlert"));
      return;
    }

    setHighlighted.mutate(
      selectedProductIds.map((id) => ({
        productId: id,
        productIsHighlight: true,
      })),
      {
        onSuccess: () => {
          setOpenHighlightModal(false);
          setSelectedProductIds([]);
        },
      },
    );
  };

  /** ================== COLUMNS ================== */
  const columns: GridColDef[] = [
    {
      field: "productName",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.name")}</strong>,
      renderCell: (params) => params.row.productName,
    },
    {
      field: "productCode",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.barcode")}</strong>,
      renderCell: (params) => params.row.productCode,
    },
    {
      field: "productImage",
      renderHeader: () => <strong>{t("promotion.column.image")}</strong>,
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
      renderHeader: () => <strong>{t("promotion.column.price")}</strong>,
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
    {
      field: "productDiscount",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.discount")}</strong>,
      renderCell: (params) => params.row.variant?.productVariantDiscount + "%",
    },

    {
      field: "productStock",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.stock")}</strong>,
      renderCell: (params) => params.row.variant?.productVariantStock,
    },
    {
      field: "productTotalSale",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.sold")}</strong>,
      renderCell: (params) => params.row.productTotalSale || 0,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{t("promotion.column.actions")}</strong>,
      flex: 1,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<HighlightOffIcon color="warning" />}
          label={t("promotion.removePromotion")}
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
      renderHeader: () => <strong>{t("promotion.select")}</strong>,
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
      renderHeader: () => <strong>{t("promotion.column.image")}</strong>,
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
      renderHeader: () => <strong>{t("promotion.column.name")}</strong>,
      renderCell: (params) => params.row.productName,
    },
    {
      field: "productCode",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.code")}</strong>,
      renderCell: (params) => params.row.productCode,
    },
    {
      field: "productSellPrice",
      flex: 1,
      renderHeader: () => <strong>{t("promotion.column.price")}</strong>,
      renderCell: (params) =>
        "Rp" +
        convertNumberToCurrency(params.row.variant?.productVariantSellPrice),
    },
  ];

  function CustomToolbar() {
    const [searchInput, setSearchInput] = useState(search);
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
          {t("promotion.addProduct")}
        </Button>

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder={t("common.search")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button onClick={() => setSearch(searchInput)}>{t("common.searchButton")}</Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("promotion.title"),
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
          sx={{ backgroundColor: "background.paper", borderRadius: 2, p: 2 }}
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
        <DialogTitle>{t("promotion.selectHighlightTitle")}</DialogTitle>
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
          <Button onClick={() => setOpenHighlightModal(false)}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveHighlight}>
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
