import { useEffect, useState, useContext } from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Tooltip,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  AlertTitle,
  useMediaQuery,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAppContext } from "../context/app.context";
import { useToken } from "../hooks/token";
import { ColorModeContext } from "../context/colorMode.context";
import { IconMenusSidebar } from "../components/icon";

import logo from "../assets/logo.jpg";

const drawerWidth = 220;
const miniDrawerWidth = 72;

function getLayoutTokens(theme: Theme) {
  const isLight = theme.palette.mode === "light";

  return {
    appBg: theme.palette.background.default,
    sidebar: theme.palette.background.paper,
    border: theme.palette.divider,
    hover: isLight ? theme.palette.grey[100] : "rgba(255,255,255,0.06)",
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
  };
}

/* ============================================================
   DRAWER MIXINS
============================================================ */
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: miniDrawerWidth,
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

/* ============================================================
   STYLED COMPONENTS
============================================================ */
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    zIndex: theme.zIndex.drawer + 1,
    background: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(18px)",
    marginLeft: open ? drawerWidth : miniDrawerWidth,
    width: `calc(100% - ${open ? drawerWidth : miniDrawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"]),
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
      width: "100%",
    },
  };
});

const Drawer = styled(MuiDrawer)<{ open?: boolean }>(({ theme, open }) => {
  const t = getLayoutTokens(theme);

  return {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    ...(open ? openedMixin(theme) : closedMixin(theme)),

    "& .MuiDrawer-paper": {
      background: t.sidebar,
      borderRight: `1px solid ${t.border}`,
      color: t.textSecondary,
      ...(open ? openedMixin(theme) : closedMixin(theme)),
    },
  };
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const { toggleColorMode } = useContext(ColorModeContext);
  const { appAlert, setAppAlert, isLoading } = useAppContext();
  const { removeToken } = useToken();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [activeLink, setActiveLink] = useState("/");

  const menuItems = [];

  const adminMenus = [
    { title: "Beranda", link: "/", iconKey: "dashboard" as const },
    { title: "Produk", link: "/products", iconKey: "products" as const },
    {
      title: "Promo",
      link: "/promotions",
      iconKey: "promotion" as const,
    },
    { title: "Kategori", link: "/categories", iconKey: "category" as const },
    { title: "Galeri", link: "/uploads", iconKey: "upload" as const },
    { title: "Pelanggan", link: "/customers", iconKey: "customers" as const },
    { title: "Pesanan", link: "/orders", iconKey: "orders" as const },
    {
      title: "Transaksi",
      link: "/transactions",
      iconKey: "transaction" as const,
    },
  ];

  const superAdminMenus = [
    ...adminMenus,
    {
      title: "Admin",
      link: "/admins",
      iconKey: "admin" as const,
    },
    { title: "Pengaturan", link: "/settings", iconKey: "settings" as const },
  ];

  const { getDecodeJwtToken } = useToken();

  const user = getDecodeJwtToken();

  if (user !== null) {
    switch (user?.userRole.toUpperCase()) {
      case "ADMIN":
        menuItems.push(...adminMenus);
        break;
      case "SUPERADMIN":
        menuItems.push(...superAdminMenus);
        break;
      default:
        break;
    }
  }

  menuItems.push({
    title: "Profil",
    link: "/my-profile",
    iconKey: "profile" as const,
  });

  useEffect(() => {
    const saved = localStorage.getItem("activeSidebarLink");
    if (saved) setActiveLink(saved);
  }, []);

  const t = getLayoutTokens(theme);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        minWidth: "100vw",
        background: t.appBg,
      }}
    >
      <CssBaseline />

      {/* ================= APP BAR ================= */}
      <AppBar position="fixed" open={openDrawer && !isMobile} elevation={0}>
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 68 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <img
                src={logo}
                width={40}
                height={40}
                style={{ borderRadius: 8 }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  background: (t) =>
                    `linear-gradient(90deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: 14, sm: 16 },
                }}
              >
                FRESH
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton onClick={toggleColorMode}>
              {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>

            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "primary.main",
                    boxShadow: (t) => `0 0 0 4px ${t.palette.primary.lighter}`,
                  }}
                />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
            >
              <MenuItem onClick={() => navigate("/my-profile")}>
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  removeToken();
                  navigate("/");
                  window.location.reload();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ================= SIDEBAR ================= */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileDrawerOpen : openDrawer}
        onClose={isMobile ? () => setMobileDrawerOpen(false) : undefined}
        ModalProps={
          isMobile
            ? {
                keepMounted: true,
              }
            : undefined
        }
      >
        <DrawerHeader>
          {isMobile ? (
            <IconButton onClick={() => setMobileDrawerOpen(false)}>
              <ChevronLeft />
            </IconButton>
          ) : (
            <IconButton onClick={() => setOpenDrawer(!openDrawer)}>
              {openDrawer ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
          )}
        </DrawerHeader>

        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const active = activeLink === item.link;

            return (
              <ListItem
                key={item.link}
                disablePadding
                sx={{
                  mb: 0.4,
                  borderRadius: 2.5,
                  position: "relative",
                  background: active ? "primary.lighter" : "transparent",
                  "&:hover": {
                    background: active ? "primary.lighter" : t.hover,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: -8,
                    top: "20%",
                    height: "60%",
                    width: 3,
                    borderRadius: 4,
                    bgcolor: active ? "primary.main" : "transparent",
                  },
                }}
                onClick={() => {
                  setActiveLink(item.link);
                  localStorage.setItem("activeSidebarLink", item.link);
                  if (isMobile) setMobileDrawerOpen(!mobileDrawerOpen);
                }}
              >
                <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={{
                    justifyContent: isMobile || openDrawer ? "flex-start" : "center",
                    px: isMobile || openDrawer ? 2 : 1.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isMobile || openDrawer ? 38 : "auto",
                      color: active ? "primary.main" : t.textSecondary,
                    }}
                  >
                    {(() => {
                      const { outline: OutlineIcon, fill: FillIcon } =
                        IconMenusSidebar[item.iconKey];
                      const Icon = active ? OutlineIcon : FillIcon;
                      return <Icon />;
                    })()}
                  </ListItemIcon>
                  {(isMobile || openDrawer) && (
                    <ListItemText
                      primary={item.title}
                      sx={{
                        whiteSpace: "nowrap",
                        fontWeight: active ? 700 : 500,
                        color: active ? t.textPrimary : t.textSecondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* ================= MAIN ================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <DrawerHeader />

        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            p: { xs: 2, sm: 3.5, md: 5 },
            mt: 2,
            mb: 8,
            minHeight: {
              xs: "calc(100vh - 96px)",
              md: "calc(100vh - 110px)",
            },
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <Backdrop open sx={{ color: "#fff" }}>
              <CircularProgress />
            </Backdrop>
          ) : (
            <Outlet />
          )}
        </Box>

        <Snackbar
          open={appAlert?.isDisplayAlert}
          autoHideDuration={4000}
          onClose={() =>
            setAppAlert({
              isDisplayAlert: false,
              alertType: undefined,
              message: "",
            })
          }
        >
          <Alert severity={appAlert?.alertType}>
            <AlertTitle>{appAlert?.alertType}</AlertTitle>
            {appAlert?.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
