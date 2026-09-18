import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Typography,
    Box,
    LinearProgress,
    Modal,
    Tabs,
    Tab,
    Grid,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    Tooltip,
    Pagination,
    Stack,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderIcon from '@mui/icons-material/Folder';
import { useUploads, useUploadImage } from '../../services/uploads';
import { getErrorMessage } from '../../utilities/getErrorMessage';

interface ButtonUploadFileTypes {
    onUpload: (urlOrName: string) => void;
}

export default function ButtonUploadWithOption({ onUpload }: ButtonUploadFileTypes) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    // Modal & tab states
    const [openModal, setOpenModal] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Gallery data
    const [page, setPage] = useState(1);

    const { data: galleryData, isLoading: loading } = useUploads(
        { page: page - 1, size: 6, filters: { search: '' } },
        { enabled: openModal && activeTab === 1 },
    );
    const tableData = galleryData?.items ?? [];
    const totalPages = galleryData?.totalPages || 1;

    const uploadImage = useUploadImage();

    // === Handle File Upload ===
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        const MAX_FILE_SIZE = 2048; // 2MB

        if (!selectedFile) {
            setUploadError(t('uploadButton.selectFileFirst'));
            setUploadProgress(null);
            setUploadSuccess(false);
            setSelectedFileName(null);
            return;
        }

        if (selectedFile.size / 1024 > MAX_FILE_SIZE) {
            setUploadError(t('uploadButton.maxFileSize'));
            setUploadProgress(null);
            setUploadSuccess(false);
            setSelectedFileName(selectedFile.name);
            return;
        }

        setUploadError(null);
        setUploadProgress(0);
        setUploadSuccess(false);
        setSelectedFileName(selectedFile.name);

        try {
            const result = await uploadImage.mutateAsync({
                file: selectedFile,
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
                    );
                    setUploadProgress(progress);
                },
            });

            setUploadProgress(null);
            setUploadSuccess(true);
            onUpload(result.url);
            setOpenModal(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadProgress(null);
            setUploadSuccess(false);
            const backendMessage = getErrorMessage(error);
            const errorMessage =
                t('uploadButton.uploadFailed') + (backendMessage ? `: ${backendMessage}` : '');
            setUploadError(errorMessage);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClickFileInput = () => fileInputRef.current?.click();

    // === Copy filename ===
    const handleCopy = (name: string) => {
        navigator.clipboard.writeText(name);
    };

    // === Ganti halaman ===
    const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <>
            {/* Tombol utama */}
            <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setOpenModal(true)}
            >
                {t('uploadButton.uploadFile')}
            </Button>

            {/* Modal Pilihan Upload */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 3,
                        width: 700,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: 24,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(_, val) => setActiveTab(val)}
                        centered
                        sx={{ mb: 2 }}
                    >
                        <Tab label={t('uploadButton.uploadFromComputer')} icon={<CloudUploadIcon />} />
                        <Tab label={t('uploadButton.chooseFromGallery')} icon={<FolderIcon />} />
                    </Tabs>

                    {/* === TAB 1: Upload === */}
                    {activeTab === 0 && (
                        <Box textAlign="center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <Button
                                variant="contained"
                                component="span"
                                onClick={handleClickFileInput}
                                startIcon={<CloudUploadIcon />}
                                disabled={uploadProgress !== null}
                            >
                                {t('uploadButton.chooseFile')}
                            </Button>

                            {selectedFileName && !uploadSuccess && !uploadError && (
                                <Typography variant="caption" mt={1} display="block">
                                    {t('uploadButton.selecting', { name: selectedFileName })}
                                </Typography>
                            )}
                            {uploadProgress !== null && (
                                <Box sx={{ width: '100%', mt: 1 }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography variant="caption">{uploadProgress}%</Typography>
                                </Box>
                            )}
                            {uploadError && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 1,
                                        color: (theme) => theme.palette.error.main,
                                    }}
                                >
                                    <ErrorOutlineIcon sx={{ mr: 0.5 }} />
                                    <Typography variant="caption">{uploadError}</Typography>
                                </Box>
                            )}
                            {uploadSuccess && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 1,
                                        color: (theme) => theme.palette.success.main,
                                    }}
                                >
                                    <CheckCircleOutlineIcon sx={{ mr: 0.5 }} />
                                    <Typography variant="caption">{t('uploadButton.uploadSuccess')}</Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* === TAB 2: Galeri === */}
                    {activeTab === 1 && (
                        <Box>
                            {loading ? (
                                <Typography textAlign="center">{t('uploadButton.loadingGallery')}</Typography>
                            ) : (
                                <>
                                    <Grid container spacing={2}>
                                        {tableData.map((file) => (
                                            <Grid item xs={4} key={file.fileId}>
                                                <Card sx={{ borderRadius: 2 }}>
                                                    <CardMedia
                                                        component="img"
                                                        image={file.url}
                                                        alt={file.fileName}
                                                        sx={{
                                                            height: 120,
                                                            objectFit: 'cover',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => {
                                                            onUpload(file.url);
                                                            setOpenModal(false);
                                                        }}
                                                    />
                                                    <CardActions
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            p: 1,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                maxWidth: 90,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {file.fileName}
                                                        </Typography>
                                                        <Tooltip title={t('uploadButton.copyFileName')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    handleCopy(file.url)
                                                                }
                                                            >
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Pagination */}
                                    <Stack alignItems="center" mt={3}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={handleChangePage}
                                            color="primary"
                                            shape="rounded"
                                        />
                                    </Stack>
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
}
