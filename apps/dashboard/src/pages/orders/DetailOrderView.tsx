import { useNavigate, useParams } from "react-router-dom";
import {
  useOrder,
  useOrderShippingTracking,
  useCreateShippingDraft,
  useConfirmShippingDraft,
} from "../../services/orders";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
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

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaidIcon from "@mui/icons-material/Paid";
import TimelineIcon from "@mui/icons-material/Timeline";
import i18n from "../../i18n";

const getOrderStatus = (status: string) => {
  switch (status) {
    case "waiting":
    case "process":
    case "delivery":
    case "draft":
    case "done":
    case "cancel":
      return i18n.t(`order.longStatus.${status}`);
    default:
      return status || "-";
  }
};

export default function DetailOrderView() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: detailOrder } = useOrder(orderId);
  const { data: shipping } = useOrderShippingTracking(detailOrder?.orderId, {
    enabled: detailOrder?.orderStatus === "delivery",
  });

  // ===== MODAL STATE =====
  const [openDraftModal, setOpenDraftModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const createShippingDraft = useCreateShippingDraft();
  const confirmShippingDraft = useConfirmShippingDraft();

  const handleUpdateOrderToDraft = async () => {
    try {
      await createShippingDraft.mutateAsync({
        orderId: orderId ? Number(orderId) : 0,
      });
      setOpenDraftModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateOrderToDelivered = async () => {
    try {
      await confirmShippingDraft.mutateAsync({
        orderId: orderId ? Number(orderId) : 0,
      });
      setOpenConfirmModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!detailOrder) return null;

  return (
    <>
      <BreadCrumberStyle
        navigation={[
          {
            label: t("order.title"),
            link: "/orders",
            icon: <IconMenus.orders fontSize="small" />,
          },
          {
            label: t("common.detail"),
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
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            {t("order.detail.back")}
          </Button>
        </Box>
        <Grid container spacing={4}>
          {/* IMAGE */}
          <Grid item xs={12} md={5}>
            <Carousel showThumbs={false}>
              {detailOrder.orderItems.map((item) => {
                const image = item.orderItemProductImage;
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
                      alt={item.orderItemProductName}
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
                {t("order.detail.title")}
              </Typography>

              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1}>
                  <Info
                    label={t("order.detail.orderId")}
                    value={detailOrder.orderReferenceId}
                  />
                  <Info
                    label={
                      <>
                        <PersonIcon fontSize="small" /> {t("order.detail.buyer")}
                      </>
                    }
                    value={detailOrder.user?.userName}
                  />
                  <Info
                    label={
                      <>
                        <WhatsAppIcon fontSize="small" /> {t("order.detail.whatsapp")}
                      </>
                    }
                    value={detailOrder.user?.userWhatsAppNumber}
                  />
                  <Info
                    label={t("order.detail.status")}
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
                  {t("order.detail.orderItems")}
                </Typography>

                {detailOrder.orderItems.map((item) => (
                  <Stack
                    key={item.orderItemId}
                    direction="row"
                    justifyContent="space-between"
                    marginBottom={5}
                  >
                    <Typography>
                      ({item.product?.productCode}) {item.orderItemProductName}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.orderItemQuantity} x Rp
                      {convertNumberToCurrency(
                        Number(item.orderItemProductSellPrice),
                      )}
                    </Typography>
                  </Stack>
                ))}
              </Card>

              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "background.default",
                }}
              >
                <Stack spacing={1}>
                  <Info
                    label={t("order.detail.subtotal")}
                    value={`Rp ${convertNumberToCurrency(
                      Number(detailOrder.orderSubtotal),
                    )}`}
                  />
                  <Info
                    label={t("order.detail.shippingFee")}
                    value={`Rp ${convertNumberToCurrency(
                      Number(detailOrder.orderShippingFee),
                    )}`}
                  />
                  <Info
                    label={
                      <>
                        <PaidIcon fontSize="small" /> {t("order.detail.total")}
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
          {t("order.detail.shippingAddress")}
        </Typography>

        <Card variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Info label={t("order.detail.name")} value={detailOrder.address?.addressUserName} />
            <Info label={t("order.detail.contact")} value={detailOrder.address?.addressKontak} />
            <Info label={t("order.detail.address")} value={detailOrder.address?.addressDetail} />
            <Info
              label={t("order.detail.region")}
              value={`${detailOrder.address?.addressKecamatanName}, ${detailOrder.address?.addressKabupatenName}, ${detailOrder.address?.addressProvinsiName}`}
            />
            <Info
              label={t("order.detail.postalCode")}
              value={detailOrder.address?.addressPostalCode}
            />
          </Stack>
        </Card>

        <Card variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Info label={t("order.detail.status")} value={detailOrder.orderStatus} bold />
            <Info
              label={t("order.detail.courier")}
              value={`${detailOrder.orderCourierCompany} - ${detailOrder.orderCourierType}`}
            />
            <Info label={t("order.detail.service")} value={detailOrder.orderShippingProvider} />
          </Stack>
        </Card>

        {/* SHIPPING */}
        {shipping && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" fontWeight={700}>
              <LocalShippingIcon sx={{ mr: 1 }} />
              {t("order.detail.shippingStatus")}
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={1}>
                    <Info label={t("order.detail.status")} value={shipping.status} bold />
                    <Info label={t("order.detail.courier")} value={shipping.courier?.company} />
                    <Info label={t("order.detail.waybill")} value={shipping.waybill_id} />
                    <Info label={t("order.detail.weight")} value={`${shipping.weight} gram`} />
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography fontWeight={600} gutterBottom>
                  <TimelineIcon sx={{ mr: 1 }} />
                  {t("order.detail.shippingHistory")}
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
              {t("order.detail.createDraft")}
            </Button>
          </Stack>
        )}

        {detailOrder.orderStatus === "draft" && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 5 }}>
            <Button
              variant="contained"
              onClick={() => setOpenConfirmModal(true)}
            >
              {t("order.detail.sendOrder")}
            </Button>
          </Stack>
        )}
      </Card>

      {/* ===== MODAL DRAFT ===== */}
      <Dialog open={openDraftModal} onClose={() => setOpenDraftModal(false)}>
        <DialogTitle>{t("order.detail.confirm")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("order.detail.confirmDraftMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDraftModal(false)}>{t("order.detail.cancel")}</Button>
          <Button variant="contained" onClick={handleUpdateOrderToDraft}>
            {t("order.detail.yesCreateDraft")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL CONFIRM ===== */}
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
      >
        <DialogTitle>{t("order.detail.confirmSendShipping")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("order.detail.confirmSendMessage")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmModal(false)}>{t("order.detail.cancel")}</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleUpdateOrderToDelivered}
          >
            {t("order.detail.sendOrder")}
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
  value: ReactNode;
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
