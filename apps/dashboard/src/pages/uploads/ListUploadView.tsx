import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowsProp,
} from "@mui/x-data-grid";
import { Add, GridView, TableRows } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Tooltip,
  Snackbar,
  Pagination,
} from "@mui/material";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { convertTime } from "../../utilities/convertTime";
import { IUpload } from "../../interfaces/Upload";
import ButtonUploadFile from "../../components/buttons/ButtonUploadFile";
import { useUploads, useRemoveUpload } from "../../services/uploads";
import ButtonUploadZip from "../../components/buttons/ButtonUploadZip";

export default function ListUploadView() {
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 12,
    page: 0,
  });

  // Default view: grid
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Upload dialog
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IUpload | null>(null);

  // Search & Snackbar
  const [searchValue, setSearchValue] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // === Fetch data ===
  const { data, isLoading: loading } = useUploads({
    page: paginationModel.page + 1,
    size: paginationModel.pageSize,
    filters: { search: committedSearch },
  });
  const tableData: GridRowsProp = data?.items ?? [];
  const rowCount = data?.totalItems ?? 0;

  const removeUpload = useRemoveUpload();

  // === Delete file ===
  const handleDelete = async (fileId: string) => {
    try {
      await removeUpload.mutateAsync(fileId);
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      setSnackbar({ open: true, message: t("gallery.fileDeleted") });
    } catch (err) {
      console.error("delete error", err);
      setSnackbar({ open: true, message: t("gallery.fileDeleteFailed") });
    }
  };
  const actionLoading = removeUpload.isPending;

  // === Upload callback ===
  const handleUploaded = async (fileKeyOrName: string) => {
    setUploadedImage(fileKeyOrName);
    setTimeout(() => {
      setOpenUploadDialog(false);
      setUploadedImage("");
      setSnackbar({ open: true, message: t("gallery.fileUploaded") });
    }, 500);

    console.log(uploadedImage);
  };

  // === Copy file name ===
  const handleCopy = (fileName: string) => {
    navigator.clipboard.writeText(fileName);
    setSnackbar({ open: true, message: t("gallery.fileNameCopied", { name: fileName }) });
  };

  // === Toolbar ===
  function PlainToolbar() {
    return (
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenUploadDialog(true)}
          >
            {t("common.upload")}
          </Button>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridView />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableRows />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder={t("common.search")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setPaginationModel((p) => ({ ...p, page: 0 }));
              setCommittedSearch(searchValue);
            }}
          >
            {t("common.searchButton")}
          </Button>
        </Stack>
      </Stack>
    );
  }

  const columns: GridColDef[] = [
    { field: "fileId", headerName: t("gallery.column.id"), width: 90 },
    { field: "fileName", headerName: t("gallery.column.name"), flex: 1, minWidth: 150 },
    {
      field: "preview",
      headerName: t("gallery.column.image"),
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.url}
          alt={params.row.fileName}
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: t("gallery.column.createdAt"),
      width: 160,
      valueFormatter: (params) => convertTime(params.value),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("gallery.column.actions"),
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label={t("common.delete")}
          onClick={() => {
            setDeleteTarget(row as IUpload);
            setOpenDeleteDialog(true);
          }}
        />,
      ],
    },
  ];

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("gallery.title"),
            link: "/uploads",
            icon: <IconMenus.upload fontSize="small" />,
          },
        ]}
      />

      <Box sx={{ width: "100%", p: 2 }}>
        <PlainToolbar />

        {/* GRID VIEW (default) */}
        {viewMode === "grid" ? (
          <>
            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ pt: 5 }}>
                  {(tableData as IUpload[]).map((item) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={item.fileId}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: 2,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={item.url}
                          alt={item.fileName}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardActions
                          sx={{
                            justifyContent: "space-between",
                            px: 1,
                            py: 0.5,
                            alignItems: "center",
                          }}
                        >
                          <Tooltip title={item.fileName}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 120,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.fileName}
                            </Typography>
                          </Tooltip>

                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title={t("gallery.copyFileName")}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleCopy(item.fileName)}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t("gallery.deleteFile")}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setDeleteTarget(item);
                                  setOpenDeleteDialog(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* PAGINATION di bawah grid */}
                <Stack alignItems="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={Math.ceil(rowCount / paginationModel.pageSize)}
                    page={paginationModel.page + 1}
                    onChange={(_, newPage) =>
                      setPaginationModel((prev) => ({
                        ...prev,
                        page: newPage - 1,
                      }))
                    }
                    color="primary"
                  />
                </Stack>
              </>
            )}
          </>
        ) : (
          <Box sx={{ height: "auto", width: "100%" }}>
            <DataGrid
              rows={tableData}
              getRowId={(row) => (row as IUpload).fileId}
              columns={columns}
              loading={loading}
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 2,
                p: 2,
              }}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={(model) => setPaginationModel(model)}
              rowCount={rowCount}
              paginationMode="server"
            />
          </Box>
        )}
      </Box>

      {/* UPLOAD DIALOG */}
      <Dialog
        open={openUploadDialog}
        onClose={() => {
          setOpenUploadDialog(false);
          setUploadedImage("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("gallery.uploadDialogTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("gallery.uploadDialogHint")}
          </Typography>

          {/* Upload gambar biasa */}
          <Box sx={{ mb: 2 }}>
            <ButtonUploadFile onUpload={(img) => handleUploaded(img)} />
          </Box>

          {/* Upload ZIP */}
          <Box sx={{ mt: 2 }}>
            <ButtonUploadZip
              onUploaded={(uploadedName) => {
                setSnackbar({
                  open: true,
                  message: t("gallery.zipUploaded", { name: uploadedName }),
                });
                setOpenUploadDialog(false);
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>{t("gallery.cancel")}</Button>
          <Button
            variant="contained"
            onClick={() => setOpenUploadDialog(false)}
          >
            {t("gallery.done")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setDeleteTarget(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("gallery.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("gallery.confirmDeleteMessage", { name: deleteTarget?.fileName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setDeleteTarget(null);
            }}
            disabled={actionLoading}
          >
            {t("gallery.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDelete(deleteTarget?.fileId ?? "")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              t("gallery.delete")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ open: false, message: "" })}
        autoHideDuration={2500}
        message={snackbar.message}
      />
    </>
  );
}
