import { useParams } from "react-router-dom";
import { useHttp } from "../../hooks/http";
import { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { convertNumberToCurrency } from "../../utilities/convertNumberToCurrency";
import { Carousel } from "react-responsive-carousel";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { getImageUrl } from "../../utilities/getImageUrl";
import {
  IConfirmShippingRequest,
  ICreateShippingDraftRequest,
  IShippingTrackInfo,
} from "../../interfaces/Shipping";
import { IOrderDetail } from "../../interfaces/Order";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaidIcon from "@mui/icons-material/Paid";
import TimelineIcon from "@mui/icons-material/Timeline";

const getOrderStatus = (status: string) => {
  let label = "";

  switch (status) {
    case "waiting":
      label = "Menunggu Pembayaran";
      break;
    case "process":
      label = "Menunggu Konfirmasi";
      break;
    case "delivery":
      label = "Sedang Dikirim";
      break;
    case "draft":
      label = "Sedang Dikemas";
      break;
    case "done":
      label = "Selesai";
      break;
    case "cancel":
      label = "Dibatalkan";
      break;
    default:
      label = status || "-";
  }
  return label;
};

export default function DetailOrderView() {
  const { handleGetRequest, handlePostRequest } = useHttp();
  const { orderId } = useParams();

  const [detailOrder, setDetailOrder] = useState<IOrderDetail | null>(null);
  const [shipping, setShipping] = useState<IShippingTrackInfo>();

  // ===== MODAL STATE =====
  const [openDraftModal, setOpenDraftModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  console.log("===== orderId =====", shipping);

  const fetchTrackingShipping = async (shippingOrderId: number) => {
    try {
      const result = await handleGetRequest({
        path: `/shipping/tracking?orderId=${shippingOrderId}`,
      });

      console.log("trackiong", result);
      setShipping(result);
    } catch (error) {
      console.error("Error fetching shipping details:", error);
    }
  };

  const getDetailOrder = async () => {
    const result: IOrderDetail = await handleGetRequest({
      path: "/orders/detail/" + orderId,
    });

    if (result) {
      console.log("===== detail order =====", result);
      setDetailOrder(result);

      if (result.orderStatus === "delivery") {
        await fetchTrackingShipping(result.orderId);
      }
    }
  };

  const handleUpdateOrderToDraft = async () => {
    try {
      const payload: ICreateShippingDraftRequest = {
        orderId: orderId ? Number(orderId) : 0,
      };
      console.log("===== payload =====", payload);

      await handlePostRequest({ path: "/shipping/draft", body: payload });
      getDetailOrder();
      setOpenDraftModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateOrderToDelivered = async () => {
    try {
      const payload: IConfirmShippingRequest = {
        orderId: orderId ? Number(orderId) : 0,
      };

      await handlePostRequest({
        path: "/shipping/draft/confirm",
        body: payload,
      });

      getDetailOrder();
      setOpenConfirmModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDetailOrder();
  }, []);

  if (!detailOrder) return null;

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Orders",
            link: "/orders",
            icon: <IconMenus.orders fontSize="small" />,
          },
          {
            label: "Detail",
            link: "/orders/detail/" + orderId,
          },
        ]}
      />

      <Card
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        <Grid container spacing={4}>
          {/* IMAGE */}
          <Grid item xs={12} md={5}>
            <Carousel showThumbs={false}>
              {detailOrder.orderItems.map((item) => {
                const image = item.product?.productImages?.[0];
                return (
                  <Box
                    key={item.orderItemId}
                    sx={{
                      height: 380,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fafafa",
                      borderRadius: 2,
                    }}
                  >
                    <img
                      src={getImageUrl(image!)}
                      alt={item.productNameSnapshot}
                      style={{ maxHeight: "100%", objectFit: "contain" }}
                    />
                  </Box>
                );
              })}
            </Carousel>
          </Grid>

          {/* DETAIL */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                <Inventory2Icon sx={{ mr: 1 }} />
                Detail Pesanan
              </Typography>

              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Info
                    label="ID Pesanan"
                    value={detailOrder.orderReferenceId}
                  />
                  <Info
                    label={
                      <>
                        <PersonIcon fontSize="small" /> Pembeli
                      </>
                    }
                    value={detailOrder.user?.userName}
                  />
                  <Info
                    label={
                      <>
                        <WhatsAppIcon fontSize="small" /> WhatsApp
                      </>
                    }
                    value={detailOrder.user?.userWhatsAppNumber}
                  />
                  <Info
                    label="Status"
                    value={
                      <Chip
                        label={getOrderStatus(detailOrder.orderStatus)}
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                </Stack>
              </Card>

              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={600} gutterBottom>
                  Item Pesanan
                </Typography>

                {detailOrder.orderItems.map((item) => (
                  <Stack
                    key={item.orderItemId}
                    direction="row"
                    justifyContent="space-between"
                    marginBottom={5}
                  >
                    <Typography>
                      ({item.product?.productCode}) {item.productNameSnapshot}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.quantity} x Rp
                      {convertNumberToCurrency(
                        Number(item.productPriceSnapshot),
                      )}
                    </Typography>
                  </Stack>
                ))}
              </Card>

              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f5f7fa",
                }}
              >
                <Stack spacing={1}>
                  <Info
                    label="Subtotal"
                    value={`Rp ${convertNumberToCurrency(
                      Number(detailOrder.orderSubtotal),
                    )}`}
                  />
                  <Info
                    label="Ongkir"
                    value={`Rp ${convertNumberToCurrency(
                      Number(detailOrder.orderShippingFee),
                    )}`}
                  />
                  <Info
                    label={
                      <>
                        <PaidIcon fontSize="small" /> Total
                      </>
                    }
                    value={`Rp ${convertNumberToCurrency(
                      Number(detailOrder.orderGrandTotal),
                    )}`}
                    bold
                  />
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* ADDRESS */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" fontWeight={700}>
          <LocationOnIcon sx={{ mr: 1 }} />
          Alamat Pengiriman
        </Typography>

        <Card variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Info label="Nama" value={detailOrder.address?.addressUserName} />
            <Info label="Kontak" value={detailOrder.address?.addressKontak} />
            <Info label="Alamat" value={detailOrder.address?.addressDetail} />
            <Info
              label="Wilayah"
              value={`${detailOrder.address?.addressKecamatan}, ${detailOrder.address?.addressKabupaten}, ${detailOrder.address?.addressProvinsi}`}
            />
            <Info
              label="Kode Pos"
              value={detailOrder.address?.addressPostalCode}
            />
          </Stack>
        </Card>

        {/* SHIPPING */}
        {shipping && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" fontWeight={700}>
              <LocalShippingIcon sx={{ mr: 1 }} />
              Status Pengiriman
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={1}>
                    <Info label="Status" value={shipping.status} bold />
                    <Info label="Kurir" value={shipping.courier?.company} />
                    <Info label="Resi" value={shipping.waybill_id} />
                    <Info label="Berat" value={`${shipping.weight} gram`} />
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography fontWeight={600} gutterBottom>
                  <TimelineIcon sx={{ mr: 1 }} />
                  Riwayat Pengiriman
                </Typography>

                <Stack spacing={2}>
                  {shipping.history?.map((item, i) => (
                    <Card
                      key={i}
                      sx={{
                        p: 2,
                        borderLeft: "5px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Typography fontWeight={600}>
                        {item.status.toUpperCase()}
                      </Typography>
                      <Typography variant="body2">{item.note}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.updated_at).toLocaleString("id-ID")}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </>
        )}

        {detailOrder.orderStatus === "process" && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button variant="contained" onClick={() => setOpenDraftModal(true)}>
              Buat Draft Pengiriman
            </Button>
          </Stack>
        )}

        {detailOrder.orderStatus === "draft" && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button
              variant="contained"
              onClick={() => setOpenConfirmModal(true)}
            >
              Kirim Pesanan
            </Button>
          </Stack>
        )}
      </Card>

      {/* ===== MODAL DRAFT ===== */}
      <Dialog open={openDraftModal} onClose={() => setOpenDraftModal(false)}>
        <DialogTitle>Konfirmasi</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah kamu yakin ingin membuat draft pengiriman untuk pesanan ini?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDraftModal(false)}>Batal</Button>
          <Button variant="contained" onClick={handleUpdateOrderToDraft}>
            Ya, Buat Draft
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL CONFIRM ===== */}
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
      >
        <DialogTitle>Konfirmasi Pengiriman</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pesanan akan dikirim ke kurir. Pastikan data sudah benar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)}>Batal</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleUpdateOrderToDelivered}
          >
            Kirim Pesanan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* ================= REUSABLE INFO ROW ================= */
function Info({
  label,
  value,
  bold,
}: {
  label: ReactNode;
  value: any;
  bold?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" sx={{ display: "flex", gap: 1 }}>
        {label}
      </Typography>
      <Typography fontWeight={bold ? 700 : 400}>{value}</Typography>
    </Stack>
  );
}
