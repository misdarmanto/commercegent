import Box from '@mui/material/Box';
import {
    GridRowsProp,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridToolbarExport,
} from '@mui/x-data-grid';
import { UploadFile } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import {
    Button,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Chip,
} from '@mui/material';
import BreadCrumberStyle from '../../../components/breadcrumb/Index';
import { IconMenus } from '../../../components/icon';
import { useHttp } from '../../../hooks/http';
import { convertTime } from '../../../utilities/convertTime';

export default function ListUploadHistoryView() {
    const [tableData, setTableData] = useState<GridRowsProp[]>([]);
    const { handleGetTableDataRequest, handlePostRequest } = useHttp();

    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });

    const handleUploadExcel = async () => {
        if (!uploadFile) return alert('Pilih file Excel terlebih dahulu!');
        try {
            setUploadLoading(true);
            const formData = new FormData();
            formData.append('file', uploadFile);

            await handlePostRequest({
                path: '/products/upload-excel',
                body: formData,
            });

            setOpenUploadDialog(false);
            setUploadFile(null);
            await getTableData({ search: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setUploadLoading(false);
        }
    };
    const getTableData = async ({ search }: { search: string }) => {
        try {
            setLoading(true);
            const result = await handleGetTableDataRequest({
                path: '/products/upload-histories',
                page: paginationModel.page ?? 0,
                size: paginationModel.pageSize ?? 10,
                filter: { search },
            });
            if (result) {
                setTableData(result.items);
                setRowCount(result.total_items);
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTableData({ search: '' });
    }, [paginationModel]);

    const columns: GridColDef[] = [
        {
            field: 'fileName',
            flex: 1,
            renderHeader: () => <strong>NAMA</strong>,
        },

        {
            field: 'status',
            flex: 1,
            renderHeader: () => <strong>STATUS</strong>,
            editable: false,
            renderCell: (params) => {
                const status = params.value;

                let color: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' =
                    'default';
                let label = '';

                switch (status) {
                    case 'PENDING':
                        color = 'warning';
                        label = 'Menunggu';
                        break;
                    case 'PROCESSING':
                        color = 'info';
                        label = 'Diproses';
                        break;
                    case 'SUCCESS':
                        color = 'success';
                        label = 'Selesai';
                        break;
                    case 'FAILED':
                        color = 'error';
                        label = 'Dibatalkan';
                        break;
                    default:
                        color = 'default';
                        label = status || '-';
                }

                return <Chip label={label} color={color} size="small" variant="outlined" />;
            },
        },
        {
            field: 'message',
            flex: 1,
            renderHeader: () => <strong>MESSAGE</strong>,
            valueFormatter: (item) => item.value || '-',
            editable: true,
        },
        {
            field: 'createdAt',
            flex: 1,
            renderHeader: () => <strong>{'UPLOADED AT'}</strong>,
            editable: true,
            valueFormatter: (item) => convertTime(item.value),
        },
    ];

    function CustomToolbar() {
        const [search, setSearch] = useState<string>('');
        return (
            <GridToolbarContainer sx={{ justifyContent: 'space-between', mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    <GridToolbarExport />
                    <Button
                        onClick={() => setOpenUploadDialog(true)}
                        startIcon={<UploadFile />}
                        variant="outlined"
                    >
                        Upload Produk
                    </Button>
                </Stack>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
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
                        label: 'Product',
                        link: '/products',
                        icon: <IconMenus.products fontSize="small" />,
                    },
                ]}
            />

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={tableData}
                    getRowId={(row) => row.fileId}
                    columns={columns}
                    autoHeight
                    sx={{ backgroundColor: 'white', borderRadius: 2, p: 2 }}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50]}
                    paginationMode="server"
                    rowCount={rowCount}
                    loading={loading}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                />
            </Box>

            <Dialog
                open={openUploadDialog}
                onClose={() => {
                    setOpenUploadDialog(false);
                    setUploadFile(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Upload Produk via Excel</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Silakan pilih file Excel (.xlsx atau .xls)
                    </Typography>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenUploadDialog(false);
                            setUploadFile(null);
                        }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleUploadExcel}
                        disabled={uploadLoading}
                        variant="contained"
                    >
                        {uploadLoading ? 'Mengunggah...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
