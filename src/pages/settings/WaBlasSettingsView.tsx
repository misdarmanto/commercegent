import { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, Stack, TextField, Snackbar, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHttp } from '../../hooks/http';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { ISettingModel } from '../../models/settingMode';
import { WaBlasFormType, WaBlasSchema } from '../../validations/settingsSchema';

export default function WaBlasSettingsView() {
    const { handleGetRequest, handlePostRequest } = useHttp();
    const [openAlert, setOpenAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<WaBlasFormType>({
        resolver: zodResolver(WaBlasSchema),
        defaultValues: {
            waBlasToken: '',
            waBlasServer: '',
        },
    });

    const getDetailSettings = async () => {
        try {
            const result: ISettingModel = await handleGetRequest({
                path: '/settings?settingType=wa_blas',
            });
            if (result && Array.isArray(result)) {
                setValue('waBlasToken', result[0].waBlasToken || '');
                setValue('waBlasServer', result[0].waBlasServer || '');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: WaBlasFormType) => {
        try {
            await handlePostRequest({
                path: '/settings',
                body: {
                    settingType: 'wa_blas',
                    ...data,
                },
            });
            setOpenAlert(true);
            getDetailSettings();
        } catch (error: unknown) {
            console.error(error);
        }
    };

    useEffect(() => {
        getDetailSettings();
    }, []);

    if (loading) return 'loading...';

    return (
        <Box>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Settings',
                        link: '/settings',
                        icon: <IconMenus.settings fontSize="small" />,
                    },
                    {
                        label: 'Wablas',
                        link: '/settings',
                    },
                ]}
            />

            <Card sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Wablas Token"
                                fullWidth
                                {...register('waBlasToken')}
                                error={!!errors.waBlasToken}
                                helperText={errors.waBlasToken?.message}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Wablas Server"
                                fullWidth
                                {...register('waBlasServer')}
                                error={!!errors.waBlasServer}
                                helperText={errors.waBlasServer?.message}
                            />
                        </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="flex-end" sx={{ marginTop: 5 }}>
                        <Button variant="contained" color="primary" type="submit">
                            Simpan
                        </Button>
                    </Stack>
                </Box>
            </Card>

            <Snackbar
                open={openAlert}
                autoHideDuration={3000}
                onClose={() => setOpenAlert(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setOpenAlert(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Data berhasil disimpan!
                </Alert>
            </Snackbar>
        </Box>
    );
}
