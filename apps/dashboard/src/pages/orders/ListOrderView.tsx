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
import { useOrders } from "../../services/orders";
import { Button, Chip, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../utilities/convertTime";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";

export default function ListOrderView() {
  const navigation = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data, isLoading: loading } = useOrders({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const columns: GridColDef[] = [
    {
      field: "orderReferenceId",
      flex: 1,
      renderHeader: () => <strong>{"ID"}</strong>,
      editable: true,
    },
    {
      field: "userName",
      flex: 1,
      renderHeader: () => <strong>{"Pembeli"}</strong>,
      editable: true,
    },
    {
      field: "orderGrandTotal",
      flex: 1,
      renderHeader: () => <strong>{"Harga"}</strong>,
      editable: true,
      valueFormatter: (item) => `Rp ${convertNumberToCurrency(item.value)}`,
    },
    {
      field: "orderStatus",
      flex: 1,
      renderHeader: () => <strong>{"Status"}</strong>,
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
            label = "Menunggu";
            break;
          case "process":
            color = "info";
            label = "Konfirmasi";
            break;
          case "delivery":
            color = "primary";
            label = "Dikirim";
            break;
          case "draft":
            color = "warning";
            label = "Dikemas";
            break;
          case "done":
            color = "success";
            label = "Selesai";
            break;
          case "cancel":
            color = "error";
            label = "Dibatalkan";
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
      renderHeader: () => <strong>{"Dipesan pada"}</strong>,
      editable: true,
      valueFormatter: (item) => convertTime(item.value),
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{"Aksi"}</strong>,
      flex: 1,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<MoreOutlined color="info" />}
            label="Detail"
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
            placeholder="search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button variant="outlined" onClick={() => setSearch(searchInput)}>
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
            label: "Orders",
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
          sx={{ backgroundColor: "background.default", borderRadius: 2, p: 2 }}
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
