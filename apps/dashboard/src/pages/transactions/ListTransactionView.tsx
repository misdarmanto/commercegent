import Box from "@mui/material/Box";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "../../services/transactions";
import { Button, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";

export default function ListTransactionView() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const { data, isLoading: loading } = useTransactions({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const columns: GridColDef[] = [
    {
      field: "transactionOrderId",
      renderHeader: () => <strong>{t("transaction.column.id")}</strong>,
      editable: true,
    },
    {
      field: "transactionProvider",
      flex: 1,
      renderHeader: () => <strong>{t("transaction.column.provider")}</strong>,
      editable: true,
    },
    {
      field: "transactionPaymentType",
      flex: 1,
      renderHeader: () => <strong>{t("transaction.column.type")}</strong>,
      editable: true,
    },
    {
      field: "transactionAmount",
      flex: 1,
      renderHeader: () => <strong>{t("transaction.column.total")}</strong>,
      editable: true,
      renderCell: (item) => {
        return "Rp" + convertNumberToCurrency(item.row.transactionAmount);
      },
    },
    {
      field: "transactionStatus",
      flex: 1,
      renderHeader: () => <strong>{t("transaction.column.status")}</strong>,
      editable: true,
      renderCell: (item) => {
        return <strong>{item.row.transactionStatus}</strong>;
      },
    },
    {
      field: "createdAt",
      flex: 1,
      renderHeader: () => <strong>{t("transaction.column.orderedAt")}</strong>,
      editable: true,
      valueFormatter: (item) => convertTime(item.value),
    },
  ];

  function CustomToolbar() {
    const [searchInput, setSearchInput] = useState<string>(search);
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
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
            label: t("transaction.title"),
            link: "/transactions",
            icon: <IconMenus.transaction fontSize="small" />,
          },
        ]}
      />
      <Box
        sx={{
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          rows={tableData}
          columns={columns}
          getRowId={(row) => row.transactionId}
          editMode="row"
          sx={{ backgroundColor: "background.paper", borderRadius: 2, p: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 0 } },
          }}
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          autoHeight
          rowCount={rowCount}
          paginationMode="server"
          loading={loading}
        />
      </Box>
    </>
  );
}
