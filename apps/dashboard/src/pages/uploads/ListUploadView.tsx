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
import { useEffect, useState } from "react";
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
import { getImageUrl } from "../../utilities/getImageUrl";
import { IUpload } from "../../interfaces/Upload";
import ButtonUploadFile from "../../components/buttons/ButtonUploadFile";
import { useHttpFileUpload } from "../../hooks/http";
import ButtonUploadZip from "../../components/buttons/ButtonUploadZip";

export default function ListUploadView() {
  const [tableData, setTableData] = useState<GridRowsProp[]>([]);
  const { handleGetFileUploadRequest, handleRemoveFileRequest } =
    useHttpFileUpload();

  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 12,
    page: 1,
  });

  // Default view: grid
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Upload dialog
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IUpload | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Snackbar
  const [searchValue, setSearchValue] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // === Fetch data ===
  const getTableData = async ({ search }: { search: string }) => {
    try {
      setLoading(true);
      const result = await handleGetFileUploadRequest({
        path: "/",
        page: paginationModel.page,
        size: paginationModel.pageSize,
        filter: { search },
      });

      if (result) {
        setTableData(result.items || []);
        setRowCount(result.total_items ?? 0);
      }
    } catch (err) {
      console.error("fetch uploads error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTableData({ search: searchValue });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel]);

  // === Delete file ===
  const handleDelete = async (fileId: string) => {
    try {
      setActionLoading(true);
      await handleRemoveFileRequest({ path: `/${fileId}` });
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      await getTableData({ search: searchValue });
      setSnackbar({ open: true, message: "File berhasil dihapus." });
    } catch (err) {
      console.error("delete error", err);
      setSnackbar({ open: true, message: "Gagal menghapus file." });
    } finally {
      setActionLoading(false);
    }
  };

  // === Upload callback ===
  const handleUploaded = async (fileKeyOrName: string) => {
    setUploadedImage(fileKeyOrName);
    setTimeout(async () => {
      setOpenUploadDialog(false);
      await getTableData({ search: searchValue });
      setUploadedImage("");
      setSnackbar({ open: true, message: "File berhasil diunggah." });
    }, 500);

    console.log(uploadedImage);
  };

  // === Copy file name ===
  const handleCopy = (fileName: string) => {
    navigator.clipboard.writeText(fileName);
    setSnackbar({ open: true, message: `Nama file "${fileName}" disalin.` });
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
            Upload
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
            placeholder="Cari..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              setPaginationModel((p) => ({ ...p, page: 0 }));
              getTableData({ search: searchValue });
            }}
          >
            Cari
          </Button>
        </Stack>
      </Stack>
    );
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "NAMA", flex: 1, minWidth: 150 },
    {
      field: "preview",
      headerName: "IMAGE",
      width: 100,
      renderCell: (params) => (
        <img
          src={getImageUrl(params.row.name)}
          alt={params.row.name}
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
      headerName: "CREATED AT",
      width: 160,
      valueFormatter: (params) => convertTime(params.value),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTION",
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Delete"
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
            label: "Uploads",
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
                  {tableData.map((item: any) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
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
                          image={getImageUrl(item.name)}
                          alt={item.name}
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
                          <Tooltip title={item.name}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 120,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.name}
                            </Typography>
                          </Tooltip>

                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Salin nama file">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleCopy(item.name)}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Hapus file">
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
              getRowId={(row) => (row as any).id}
              columns={columns}
              loading={loading}
              sx={{
                backgroundColor: "background.default",
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
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unggah gambar (600×600 px, maks 2MB) atau file ZIP berisi banyak
            gambar.
          </Typography>

          {/* Upload gambar biasa */}
          <Box sx={{ mb: 2 }}>
            <ButtonUploadFile onUpload={(img) => handleUploaded(img)} />
          </Box>

          {/* Upload ZIP */}
          <Box sx={{ mt: 2 }}>
            <ButtonUploadZip
              onUploaded={async (uploadedName) => {
                setSnackbar({
                  open: true,
                  message: `ZIP berhasil diunggah: ${uploadedName}`,
                });
                setOpenUploadDialog(false);
                await getTableData({ search: searchValue });
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setOpenUploadDialog(false);
              await getTableData({ search: searchValue });
            }}
          >
            Selesai
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
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah anda yakin ingin menghapus <b>{deleteTarget?.name}</b>?
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
            Batal
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDelete(deleteTarget?.name ?? "")}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Hapus"
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
