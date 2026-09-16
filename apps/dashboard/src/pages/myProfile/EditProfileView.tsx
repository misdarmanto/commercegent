import { useEffect, useState } from "react";
import { Button, Card, Typography, Box, TextField, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  useMyProfileForEdit,
  useUpdateMyProfile,
} from "../../services/myProfile";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useTranslation } from "react-i18next";

export default function EditProfileView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = useParams();

  const { data: profile } = useMyProfileForEdit();
  const updateProfile = useUpdateMyProfile();

  const [user, setUser] = useState({
    userId: userId!,
    userName: "",
    userPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setUser((prev) => ({
        ...prev,
        userName: profile.userName ?? prev.userName,
        userPassword: profile.userPassword ?? prev.userPassword,
      }));
    }
  }, [profile]);

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync(user);
      navigate("/my-profile");
    } catch (error: unknown) {
      console.log(error);
    }
  };

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("myProfile.title"),
            link: "/profile",
            icon: <IconMenus.profile fontSize="small" />,
          },
          {
            label: t("common.edit"),
            link: "/profile/" + userId,
          },
        ]}
      />
      <Card
        sx={{
          mt: 5,
          p: 8,
        }}
      >
        <Typography
          variant="h4"
          marginBottom={5}
          color="primary"
          fontWeight={"bold"}
        >
          {t("myProfile.editTitle")}
        </Typography>
        <Box
          component="form"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextField
            label={t("myProfile.userName")}
            id="outlined-start-adornment"
            sx={{ m: 1 }}
            value={user?.userName}
            type="text"
            onChange={(e) => {
              setUser({
                ...user,
                userName: e.target.value,
              });
            }}
          />
          <TextField
            label={t("myProfile.password")}
            id="outlined-start-adornment"
            sx={{ m: 1 }}
            value={user?.userPassword}
            type="password"
            onChange={(e) => {
              setUser({
                ...user,
                userPassword: e.target.value,
              });
            }}
          />

          <Stack direction={"row"} justifyContent="flex-end">
            <Button
              sx={{
                m: 1,
                width: "25ch",
                backgroundColor: "dodgerblue",
                color: "#FFF",
                fontWeight: "bold",
              }}
              variant={"contained"}
              onClick={handleSubmit}
            >
              {t("myProfile.submit")}
            </Button>
          </Stack>
        </Box>
      </Card>
    </>
  );
}
