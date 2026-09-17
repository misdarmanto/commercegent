import { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUploadZip } from '../../services/uploads';

interface ButtonUploadZipProps {
    onUploaded?: (fileName: string) => void;
}

export default function ButtonUploadZip({ onUploaded }: ButtonUploadZipProps) {
    const { t } = useTranslation();
    const uploadZip = useUploadZip();

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string | null>(null);

    // === Upload ZIP handler ===
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.zip')) {
            alert(t('uploadButton.zipOnlyAlert'));
            e.target.value = '';
            return;
        }

        setFileName(file.name);
        setUploading(true);
        setProgress(0);

        try {
            // Simulasi progress upload manual
            const fakeProgress = setInterval(() => {
                setProgress((prev) => (prev < 90 ? prev + 10 : prev));
            }, 300);

            const result = await uploadZip.mutateAsync(file);

            clearInterval(fakeProgress);
            setProgress(100);
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                if (onUploaded) onUploaded(result.fileName || file.name);
            }, 500);
        } catch (error) {
            console.error(error);
            alert(t('uploadButton.zipFailedAlert'));
            setUploading(false);
            setProgress(0);
        } finally {
            e.target.value = ''; // Reset input
        }
    };

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Button variant="outlined" component="label" disabled={uploading}>
                {t('uploadButton.uploadZipFile')}
                <input type="file" hidden accept=".zip" onChange={handleFileChange} />
            </Button>

            {uploading && (
                <Box sx={{ mt: 2, width: '100%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {t('uploadButton.uploadingZip', { progress })}
                    </Typography>
                    {fileName && (
                        <Typography variant="caption" color="text.secondary">
                            {fileName}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}
