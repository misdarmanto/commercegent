import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  GridRowsProp,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Add, ArrowBack } from "@mui/icons-material";
import { useState } from "react";
import {
  useCategories,
  useRemoveCategory,
} from "../../../services/categories";
import { Button, Stack, TextField } from "@mui/material";
import BreadCrumberStyle from "../../../components/breadcrumb/Index";
import { IconMenus } from "../../../components/icon";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../components/modal";
import { ICategory } from "../../../interfaces/Category";
import SubCategoryFormView from "./SubCategoryFormView";

export default function ListSubCategoryView() {
  const navigation = useNavigate();
  const { categoryReference } = useParams<{ categoryReference: string }>();

  const [modalDeleteData, setModalDeleteData] = useState<ICategory>();
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [openSubCategoryModal, setOpenSubCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  const [search, setSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { data, isLoading } = useCategories({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    categoryType: "child",
    categoryReference,
    filters: { search },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const removeCategory = useRemoveCategory();

  const handleDeleteCategory = (categoryId: string) => {
    removeCategory.mutate(categoryId);
  };

  const handleOpenModalDelete = (data: ICategory) => {
    setModalDeleteData(data);
    setOpenModalDelete(!openModalDelete);
  };

  const columns: GridColDef[] = [
    {
      field: "categoryReference",
      flex: 1,
      renderHeader: () => <strong>{"PARENT ID"}</strong>,
      editable: true,
    },
    {
      field: "categoryId",
      flex: 1,
      renderHeader: () => <strong>{"ID"}</strong>,
      editable: true,
    },
    {
      field: "categoryName",
      flex: 1,
      renderHeader: () => <strong>{"NAMA"}</strong>,
      editable: true,
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
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => {
              setSelectedCategoryId(row.categoryId);
              setOpenSubCategoryModal(true);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Delete"
            onClick={() => handleOpenModalDelete(row)}
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
          <Button
            onClick={() => navigation("/categories")}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setSelectedCategoryId(undefined);
              setOpenSubCategoryModal(true);
            }}
            startIcon={<Add />}
            variant="outlined"
          >
            Tambah Kategori
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={1} alignItems={"center"}>
          <TextField
            size="small"
            placeholder="cari..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button variant="outlined" onClick={() => setSearch(searchInput)}>
            Cari
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
            label: "Category",
            link: "/categories/subcategories/",
            icon: <IconMenus.category fontSize="small" />,
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
          getRowId={(row) => row.categoryId}
          columns={columns}
          editMode="row"
          sx={{ backgroundColor: "background.default", borderRadius: 2, p: 2 }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 1 } },
          }}
          pageSizeOptions={[2, 5, 10, 25]}
          autoHeight
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{
            toolbar: CustomToolbar,
          }}
          rowCount={rowCount}
          paginationMode="server"
          loading={isLoading}
        />
      </Box>

      <Modal
        openModal={openModalDelete}
        handleModalOnCancel={() => setOpenModalDelete(false)}
        message={
          "Apakah anda yakin ingin menghapus kategori " +
          modalDeleteData?.categoryName
        }
        handleModal={() => {
          handleDeleteCategory(modalDeleteData?.categoryId ?? "");
          setOpenModalDelete(!openModalDelete);
        }}
      />

      <SubCategoryFormView
        open={openSubCategoryModal}
        categoryId={selectedCategoryId}
        categoryReference={categoryReference}
        onClose={() => setOpenSubCategoryModal(false)}
      />
    </>
  );
}
