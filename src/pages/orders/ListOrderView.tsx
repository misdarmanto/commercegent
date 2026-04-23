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
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
import { Button, Chip, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../utilities/convertTime";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";

export default function ListOrderView() {
  const navigation = useNavigate();
  const [tableData, setTableData] = useState<GridRowsProp[]>([]);
  const { handleGetTableDataRequest } = useHttp();

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const getTableData = async ({ search }: { search: string }) => {
    try {
      setLoading(true);
      const result = await handleGetTableDataRequest({
        path: "/orders",
        page: paginationModel.page ?? 0,
        size: paginationModel.pageSize ?? 10,
        filter: { search },
      });

      if (result && result.items) {
        console.log(result.items);
        const mapingData = result.items.map((item: any) => {
          return {
            ...item,
            userName: item?.user?.userName,
            orderProductName: item?.product?.productName,
          };
        });

        setTableData(mapingData);
        setRowCount(result.total_items);
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
    const [search, setSearch] = useState<string>("");
    return (
      <GridToolbarContainer sx={{ justifyContent: "space-between", mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <GridToolbarExport />
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
