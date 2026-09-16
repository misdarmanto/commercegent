/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { MoreOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrders } from "../../services/orders";
import { Button, Chip, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../utilities/convertTime";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";

export default function ListOrderView() {
  const { t } = useTranslation();
  const navigation = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data, isLoading: loading } = useOrders({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const columns: GridColDef[] = [
    {
      field: "orderReferenceId",
      flex: 1,
      renderHeader: () => <strong>{t("order.column.id")}</strong>,
      editable: true,
    },
    {
      field: "userName",
      flex: 1,
      renderHeader: () => <strong>{t("order.column.buyer")}</strong>,
      editable: true,
    },
    {
      field: "orderGrandTotal",
      flex: 1,
      renderHeader: () => <strong>{t("order.column.price")}</strong>,
      editable: true,
      valueFormatter: (item) => `Rp ${convertNumberToCurrency(item.value)}`,
    },
    {
      field: "orderStatus",
      flex: 1,
      renderHeader: () => <strong>{t("order.column.status")}</strong>,
      editable: false,
      renderCell: (params) => {
        const status = params.value;

        let color:
          | "default"
          | "primary"
          | "success"
          | "error"
          | "warning"
          | "info" = "default";
        let label = "";

        switch (status) {
          case "waiting":
            color = "warning";
            label = t("order.status.waiting");
            break;
          case "process":
            color = "info";
            label = t("order.status.process");
            break;
          case "delivery":
            color = "primary";
            label = t("order.status.delivery");
            break;
          case "draft":
            color = "warning";
            label = t("order.status.draft");
            break;
          case "done":
            color = "success";
            label = t("order.status.done");
            break;
          case "cancel":
            color = "error";
            label = t("order.status.cancel");
            break;
          default:
            color = "default";
            label = status || "-";
        }

        return (
          <Chip label={label} color={color} size="small" variant="outlined" />
        );
      },
    },
    {
      field: "createdAt",
      flex: 1,
      renderHeader: () => <strong>{t("order.column.orderedAt")}</strong>,
      editable: true,
      valueFormatter: (item) => convertTime(item.value),
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{t("order.column.actions")}</strong>,
      flex: 1,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<MoreOutlined color="info" />}
            label={t("common.detail")}
            onClick={() => navigation("/orders/detail/" + row.orderId)}
            color="inherit"
          />,
        ];
      },
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
            label: t("order.title"),
            link: "/orders",
            icon: <IconMenus.orders fontSize="small" />,
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
          editMode="row"
          getRowId={(row: any) => row.orderId}
          sx={{ backgroundColor: "background.paper", borderRadius: 2, p: 2 }}
          autoHeight
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 1 } },
          }}
          loading={loading}
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          rowCount={rowCount}
          paginationMode="server"
        />
      </Box>
    </>
  );
}
