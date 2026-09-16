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
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdmins, useRemoveAdmin } from "../../services/admins";
import { Button, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useNavigate } from "react-router-dom";
import ModalStyle from "../../components/modal";
import { IUser } from "../../interfaces/User";

export default function ListAdminView() {
  const { t } = useTranslation();
  const navigation = useNavigate();

  const [modalDeleteData, setModalDeleteData] = useState<IUser>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const { data, isLoading: loading } = useAdmins({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const removeAdmin = useRemoveAdmin();

  const handleDeleteAdmin = (userId: number) => {
    removeAdmin.mutate(userId);
  };

  const handleOpenModalDelete = (data: IUser) => {
    setModalDeleteData(data);
    setOpenModalDelete(!openModalDelete);
  };

  const columns: GridColDef[] = [
    {
      field: "userName",
      flex: 1,
      renderHeader: () => <strong>{t("admin.column.name")}</strong>,
      editable: true,
    },
    {
      field: "userRole",
      renderHeader: () => <strong>{t("admin.column.role")}</strong>,
      flex: 1,
      editable: true,
      type: "singleSelect",
      valueOptions: ["admin", "superAdmin"],
    },
    {
      field: "createdAt",
      renderHeader: () => <strong>{t("admin.column.createdAt")}</strong>,
      editable: true,
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{t("admin.column.actions")}</strong>,
      flex: 1,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label={t("common.edit")}
            className="textPrimary"
            onClick={() => navigation("/admins/edit/" + row.userId)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label={t("common.delete")}
            onClick={() => handleOpenModalDelete(row)}
            color="inherit"
          />,
          // <GridActionsCellItem
          //     icon={<MoreOutlined color="info" />}
          //     label="Detail"
          //     onClick={() => navigation('/admins/detail/' + row.userId)}
          //     color="inherit"
          // />,
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
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={() => navigation("/admins/create")}
          >
            {t("admin.addAdmin")}
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
    <Box>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("admin.title"),
            link: "/admins",
            icon: <IconMenus.admin fontSize="small" />,
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
          getRowId={(row) => row.userId}
          sx={{ backgroundColor: "white", borderRadius: 2, p: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 2, page: 0 } },
          }}
          autoHeight
          pageSizeOptions={[2, 5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          rowCount={rowCount}
          paginationMode="server"
          loading={loading}
        />
      </Box>

      <ModalStyle
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={t("common.confirmDeleteNamed", { name: modalDeleteData?.userName })}
        handleModal={() => {
          handleDeleteAdmin(modalDeleteData?.userId!);
          setOpenModalDelete(!openModalDelete);
        }}
      />
    </Box>
  );
}
