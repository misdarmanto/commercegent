import { Box, Typography, Card, Stack, Avatar, Divider, Grid } from '@mui/material';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { useHttp } from '../../hooks/http';
import { useEffect, useState } from 'react';
import { IUserModel } from '../../models/userModel';
import { convertTime } from '../../utilities/convertTime';

const ProfileView = () => {
    const { handleGetRequest } = useHttp();
    const [detailProfile, setDetailProfile] = useState<IUserModel>();

    const getMyProfile = async () => {
        const result = await handleGetRequest({ path: '/my-profiles' });
        setDetailProfile(result);
    };

    useEffect(() => {
        getMyProfile();
    }, []);

    return (
        <Box>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Profile',
                        link: '/profile',
                        icon: <IconMenus.profile fontSize="small" />,
                    },
                ]}
            />

            <Card
                sx={{
                    mt: 6,
                    p: 5,
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
            >
                <Stack direction="row" spacing={4} alignItems="center" mb={4}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontSize: 40,
                            fontWeight: 600,
                            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        {detailProfile?.userName?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {detailProfile?.userName || 'User'}
                        </Typography>
                        <Typography color="text.secondary" fontSize={18}>
                            {detailProfile?.userRole || 'Role tidak diketahui'}
                        </Typography>
                        <Typography color="text.disabled" fontSize={14} mt={1}>
                            Bergabung sejak{' '}
                            {detailProfile?.createdAt ? convertTime(detailProfile.createdAt) : '-'}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography color="text.secondary" fontSize={14} mb={0.5}>
                                Username
                            </Typography>
                            <Typography fontWeight={500} fontSize={16}>
                                {detailProfile?.userName || '-'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography color="text.secondary" fontSize={14} mb={0.5}>
                                Role
                            </Typography>
                            <Typography
                                fontWeight={600}
                                color="primary"
                                fontSize={16}
                                textTransform="capitalize"
                            >
                                {detailProfile?.userRole || '-'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography color="text.secondary" fontSize={14} mb={0.5}>
                                Dibuat Pada
                            </Typography>
                            <Typography fontWeight={500} fontSize={16}>
                                {detailProfile?.createdAt
                                    ? convertTime(detailProfile.createdAt)
                                    : '-'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    );
};

export default ProfileView;
