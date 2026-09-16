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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      renderHeader: () => <strong>{t("category.column.parentId")}</strong>,
      editable: true,
    },
    {
      field: "categoryId",
      flex: 1,
      renderHeader: () => <strong>{t("category.column.id")}</strong>,
      editable: true,
    },
    {
      field: "categoryName",
      flex: 1,
      renderHeader: () => <strong>{t("category.column.name")}</strong>,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => <strong>{t("category.column.actions")}</strong>,
      flex: 1,
      cellClassName: "actions",
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label={t("common.edit")}
            className="textPrimary"
            onClick={() => {
              setSelectedCategoryId(row.categoryId);
              setOpenSubCategoryModal(true);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label={t("common.delete")}
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
            {t("common.back")}
          </Button>
          <Button
            onClick={() => {
              setSelectedCategoryId(undefined);
              setOpenSubCategoryModal(true);
            }}
            startIcon={<Add />}
            variant="outlined"
          >
            {t("category.addSubCategory")}
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
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("category.title"),
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
          sx={{ backgroundColor: "background.paper", borderRadius: 2, p: 2 }}
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
        message={t("common.confirmDeleteNamed", { name: modalDeleteData?.categoryName })}
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
