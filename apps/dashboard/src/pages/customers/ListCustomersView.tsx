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
import { useCustomers } from "../../services/customers";
import { Button, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import { convertTime } from "../../utilities/convertTime";

export default function ListCustomersView() {
  const navigation = useNavigate();
  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const { data, isLoading: loading } = useCustomers({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const columns: GridColDef[] = [
    {
      field: "userName",
      flex: 1,
      renderHeader: () => <strong>{"Nama"}</strong>,
      editable: true,
    },
    {
      field: "userWhatsAppNumber",
      flex: 1,
      renderHeader: () => <strong>{"WA"}</strong>,
      editable: true,
    },
    {
      field: "userPartnerCode",
      flex: 1,
      renderHeader: () => <strong>{"Kode Partner"}</strong>,
      editable: true,
    },
    {
      field: "createdAt",
      flex: 1,
      renderHeader: () => <strong>{"Registrasi Pada"}</strong>,
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
            onClick={() => navigation("/customers/detail/" + row.userId)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  function CustomToolbar() {
    const [searchInput, setSearchInput] = useState(search);

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
            label: "Customers",
            link: "/customers",
            icon: <IconMenus.customers fontSize="small" />,
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
          getRowId={(row) => row.userId}
          columns={columns}
          editMode="row"
          sx={{ backgroundColor: "background.default", borderRadius: 2, p: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 0 } },
          }}
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          loading={loading}
          autoHeight
          rowCount={rowCount}
          paginationMode="server"
        />
      </Box>
    </>
  );
}
