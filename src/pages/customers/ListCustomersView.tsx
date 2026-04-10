/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import {
    GridRowsProp,
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarExport,
} from '@mui/x-data-grid';
import { MoreOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useHttp } from '../../hooks/http';
import { Button, Stack, TextField } from '@mui/material';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { useNavigate } from 'react-router-dom';
import { convertTime } from '../../utilities/convertTime';

export default function ListCustomersView() {
    const navigation = useNavigate();
    const [tableData, setTableData] = useState<GridRowsProp[]>([]);
    const { handleGetTableDataRequest } = useHttp();

    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });

    const getTableData = async ({ search }: { search: string }) => {
        try {
            setLoading(true);
            const result = await handleGetTableDataRequest({
                path: '/users',
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
            field: 'userName',
            flex: 1,
            renderHeader: () => <strong>{'Nama'}</strong>,
            editable: true,
        },
        {
            field: 'userWhatsAppNumber',
            flex: 1,
            renderHeader: () => <strong>{'WA'}</strong>,
            editable: true,
        },
        {
            field: 'userPartnerCode',
            flex: 1,
            renderHeader: () => <strong>{'Kode Partner'}</strong>,
            editable: true,
        },
        {
            field: 'createdAt',
            flex: 1,
            renderHeader: () => <strong>{'Registrasi Pada'}</strong>,
            editable: true,
            valueFormatter: (item) => convertTime(item.value),
        },
        {
            field: 'actions',
            type: 'actions',
            renderHeader: () => <strong>{'Aksi'}</strong>,
            flex: 1,
            cellClassName: 'actions',
            getActions: ({ row }) => {
                return [
                    <GridActionsCellItem
                        icon={<MoreOutlined color="info" />}
                        label="Detail"
                        onClick={() => navigation('/customers/detail/' + row.userId)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    function CustomToolbar() {
        const [search, setSearch] = useState('');

        return (
            <GridToolbarContainer sx={{ justifyContent: 'space-between', mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    <GridToolbarExport />
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
                        label: 'Customers',
                        link: '/customers',
                        icon: <IconMenus.customers fontSize="small" />,
                    },
                ]}
            />
            <Box
                sx={{
                    width: '100%',
                    '& .actions': {
                        color: 'text.secondary',
                    },
                    '& .textPrimary': {
                        color: 'text.primary',
                    },
                }}
            >
                <DataGrid
                    rows={tableData}
                    getRowId={(row) => row.userId}
                    columns={columns}
                    editMode="row"
                    sx={{ backgroundColor: 'white', borderRadius: 2, p: 2 }}
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
