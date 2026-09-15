import {
  Card,
  Grid,
  Box,
  Stack,
  Typography,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import BreadCrumberStyle from "../../components/breadcrumb/Index";
import { IconMenus } from "../../components/icon";
import { useEffect, useState } from "react";
import { useHttp } from "../../hooks/http";
import { useNavigate } from "react-router-dom";
import ListOrderView from "../orders/ListOrderView";
import { IStatisticTotal } from "../../interfaces/Stats";

const DashboardView = () => {
  const { handleGetRequest } = useHttp();
  const navigation = useNavigate();
  const theme = useTheme();

  const [statisticTotal, setStatisticTotal] = useState<IStatisticTotal>();
  const [visitorRange, setVisitorRange] = useState("1d");
  const [visitorInterval, setVisitorInterval] = useState("1h");
  const [visitorSeries, setVisitorSeries] = useState<number[]>([]);
  const [visitorCategories, setVisitorCategories] = useState<string[]>([]);

  const getStatistic = async () => {
    const result: IStatisticTotal = await handleGetRequest({
      path: "/statistic/total",
    });
    setStatisticTotal(result);
  };

  const getVisitorStatistic = async (range: string, interval: string) => {
    try {
      const result = await handleGetRequest({
        path: `/statistic/visitor?range=${range}&interval=${interval}`,
      });

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setVisitorCategories(rows.map((item: { date: string }) => item.date));
      setVisitorSeries(
        rows.map((item: { total: number | string }) => Number(item.total ?? 0)),
      );
    } catch (error) {
      console.log(error);
      setVisitorCategories([]);
      setVisitorSeries([]);
    }
  };

  useEffect(() => {
    getStatistic();
  }, []);

  useEffect(() => {
    getVisitorStatistic(visitorRange, visitorInterval);
  }, [visitorRange, visitorInterval]);

  const summaryCards = [
    {
      title: "Penjualan",
      value: statisticTotal?.totalTransaction ?? 0,
      icon: <IconMenus.transaction fontSize="large" />,
      color: theme.palette.primary.main,
      route: "/transactions",
    },
    {
      title: "Produk",
      value: statisticTotal?.totalProduct ?? 0,
      icon: <IconMenus.products fontSize="large" />,
      color: theme.palette.success.main,
      route: "/products",
    },
    {
      title: "Pesanan",
      value: statisticTotal?.totalOrder ?? 0,
      icon: <IconMenus.orders fontSize="large" />,
      color: theme.palette.warning.main,
      route: "/orders",
    },
    {
      title: "Pelanggan",
      value: statisticTotal?.totalCustomer ?? 0,
      icon: <IconMenus.customers fontSize="large" />,
      color: theme.palette.info.main,
      route: "/customers",
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <BreadCrumberStyle
        navigation={[
          {
            label: "Beranda",
            link: "/",
            icon: <IconMenus.dashboard fontSize="small" />,
          },
        ]}
      />

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {summaryCards.map((item, index) => (
          <Grid item key={index} md={3} sm={6} xs={12}>
            <Card
              onClick={() => navigation(item.route)}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <IconButton
                sx={{
                  bgcolor: `${item.color}22`,
                  color: item.color,
                  p: 1.5,
                  borderRadius: 3,
                }}
              >
                {item.icon}
              </IconButton>

              <Stack spacing={0.5}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", fontWeight: 600 }}
                >
                  {item.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {item.value.toLocaleString("id-ID")}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item md={7} xs={12}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Trafik Pengunjung
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel id="visitor-range-label">Range</InputLabel>
                  <Select
                    labelId="visitor-range-label"
                    value={visitorRange}
                    label="Range"
                    onChange={(e) => setVisitorRange(e.target.value)}
                  >
                    <MenuItem value="1d">1d</MenuItem>
                    <MenuItem value="7d">7d</MenuItem>
                    <MenuItem value="1m">1m</MenuItem>
                    <MenuItem value="3m">3m</MenuItem>
                    <MenuItem value="1y">1y</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel id="visitor-interval-label">Interval</InputLabel>
                  <Select
                    labelId="visitor-interval-label"
                    value={visitorInterval}
                    label="Interval"
                    onChange={(e) => setVisitorInterval(e.target.value)}
                  >
                    <MenuItem value="1h">1h</MenuItem>
                    <MenuItem value="12h">12h</MenuItem>
                    <MenuItem value="1d">1d</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <ReactApexChart
              options={{
                chart: { height: 350, type: "area", toolbar: { show: false } },
                dataLabels: { enabled: false },
                colors: [theme.palette.primary.main],
                stroke: { curve: "smooth", width: 2 },
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                  },
                },
                xaxis: {
                  type: "category",
                  labels: {
                    show: false,
                    style: { colors: theme.palette.text.secondary },
                  },
                  categories: visitorCategories,
                },
                tooltip: {
                  x: { show: true },
                },
              }}
              series={[{ name: "Trafik", data: visitorSeries }]}
              type="area"
              height={350}
            />
          </Card>
        </Grid>

        <Grid item md={5} xs={12}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              mb={2}
            >
              Distribusi Gender
            </Typography>
            <ReactApexChart
              options={{
                chart: { type: "pie" },
                labels: ["Pria", "Wanita"],
                legend: {
                  position: "bottom",
                  labels: { colors: theme.palette.text.secondary },
                },
                colors: [theme.palette.primary.light, theme.palette.info.main],
              }}
              series={[
                statisticTotal?.totalUserPria ?? 0,
                statisticTotal?.totalUserWanita ?? 0,
              ]}
              type="pie"
              width="100%"
            />
          </Card>
        </Grid>
      </Grid>

      {/* Order Section */}
      <Box sx={{ my: 5 }}></Box>

      <ListOrderView />
    </Box>
  );
};

export default DashboardView;
