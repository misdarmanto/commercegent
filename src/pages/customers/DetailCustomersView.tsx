import { useParams } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { convertTime } from "../../utilities/convertTime";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { IUser } from "../../interfaces/User";

export default function DetailCustomersView() {
  const { handleGetRequest, handleUpdateRequest } = useHttp();
  const { customerId } = useParams();

  const [detailCustomer, setDetailCustomer] = useState<IUser>();
  const [openModalUpdateCoin, setOpenModalUpdateCoin] = useState(false);
  const [coinSelected, setCoinSelected] = useState(0);

  const handleOpenModalUpdateCoin = () => {
    setOpenModalUpdateCoin(!openModalUpdateCoin);
  };

  const getDetailUser = async () => {
    const result = await handleGetRequest({
      path: "/users/detail/" + customerId,
    });
    if (result) {
      setDetailCustomer(result);
      setCoinSelected(result?.userCoin);
    }
  };

  const handleUpdateCoin = async () => {
    try {
      const payload = {
        userCoin: coinSelected,
        userId: detailCustomer?.userId + "",
      };

      await handleUpdateRequest({
        path: "/users/update-coin",
        body: payload,
      });

      getDetailUser();
      setOpenModalUpdateCoin(false);
    } catch (error: unknown) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDetailUser();
  }, []);

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Customers",
            link: "/customers",
            icon: <IconMenus.customers fontSize="small" />,
          },
          {
            label: "Customers",
            link: "/customers/detail/" + customerId,
          },
        ]}
      />
      <Grid container spacing={2} mb={2}>
        <Grid item sm={4} xs={12}>
          <Card sx={{ p: 3, minWidth: 200 }}>
            <Stack direction="row" justifyContent={"space-between"}>
              <Stack direction="row" spacing={2}>
                <IconMenus.transaction fontSize="large" color={"inherit"} />
                <Stack justifyContent="center">
                  <Typography>Koin</Typography>
                  <Typography fontSize="large" fontWeight="bold">
                    {detailCustomer?.userCoin}
                  </Typography>
                </Stack>
              </Stack>
              <Button onClick={handleOpenModalUpdateCoin}>Update Koin</Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 5 }}>
        <table>
          <thead>
            <th></th>
            <th></th>
            <th></th>
          </thead>
          <tbody>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Nama</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{detailCustomer?.userName}</Typography>
              </td>
            </tr>

            <tr>
              <td>
                <Typography fontWeight={"Bold"}>WA</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{detailCustomer?.userWhatsAppNumber}</Typography>
              </td>
            </tr>

            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Kode Partner</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{detailCustomer?.userPartnerCode}</Typography>
              </td>
            </tr>

            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Role</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>{detailCustomer?.userRole}</Typography>
              </td>
            </tr>
            <tr>
              <td>
                <Typography fontWeight={"Bold"}>Bergabung</Typography>
              </td>
              <td>:</td>
              <td>
                <Typography>
                  {convertTime((detailCustomer?.createdAt || "") ?? "")}
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
      <Dialog
        open={openModalUpdateCoin}
        onClose={handleOpenModalUpdateCoin}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Update Coin?"}</DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-number"
            label="Coin"
            type="number"
            value={coinSelected}
            inputProps={{ min: 0 }}
            onChange={(e) => setCoinSelected(+e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenModalUpdateCoin}>Cancel</Button>
          <Button onClick={handleUpdateCoin} autoFocus>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
