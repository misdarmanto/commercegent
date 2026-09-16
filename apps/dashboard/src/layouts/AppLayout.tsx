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
  Divider,
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
  LogoutRounded,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAppContext } from "../context/app.context";
import { useToken } from "../hooks/token";
import { ColorModeContext } from "../context/colorMode.context";
import { IconMenusSidebar } from "../components/icon";

import logo from "../assets/logo.jpg";

const drawerWidth = 248;
const miniDrawerWidth = 80;

function getSidebarTokens(theme: Theme) {
  const isLight = theme.palette.mode === "light";

  return isLight
    ? {
        bg: theme.palette.background.paper,
        bgElevated: theme.palette.background.paper,
        border: theme.palette.divider,
        textActive: theme.palette.text.primary,
        textInactive: theme.palette.text.secondary,
        // Text/icon color on top of the solid active-item pill — always
        // white since that pill is a solid primary-color fill in both modes.
        onActiveItem: "#FFFFFF",
        hover: theme.palette.grey[100],
      }
    : {
        bg: "#0B1120",
        bgElevated: "#111A2E",
        border: "rgba(148,163,184,0.12)",
        textActive: "#FFFFFF",
        textInactive: "rgba(226,232,240,0.6)",
        onActiveItem: "#FFFFFF",
        hover: "rgba(255,255,255,0.06)",
      };
}

function getLayoutTokens(theme: Theme) {
  const isLight = theme.palette.mode === "light";

  return {
    appBg: theme.palette.background.default,
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
  const t = getSidebarTokens(theme);

  return {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    ...(open ? openedMixin(theme) : closedMixin(theme)),

    "& .MuiDrawer-paper": {
      background: `linear-gradient(180deg, ${t.bgElevated} 0%, ${t.bg} 100%)`,
      borderRight: `1px solid ${t.border}`,
      color: t.textInactive,
      display: "flex",
      flexDirection: "column",
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
  const sidebarTokens = getSidebarTokens(theme);

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
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: isMobile || openDrawer ? 2.5 : 0,
            justifyContent: isMobile || openDrawer ? "flex-start" : "center",
            ...theme.mixins.toolbar,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="FRESH"
            sx={{ width: 34, height: 34, borderRadius: 1.5, flexShrink: 0 }}
          />
          {(isMobile || openDrawer) && (
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: ".1em",
                color: sidebarTokens.textActive,
                whiteSpace: "nowrap",
              }}
            >
              FRESH
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: sidebarTokens.border, mx: 2 }} />

        <List sx={{ px: 1.5, py: 2, flex: 1 }}>
          {menuItems.map((item) => {
            const active = activeLink === item.link;
            const { outline: OutlineIcon, fill: FillIcon } =
              IconMenusSidebar[item.iconKey];
            const Icon = active ? FillIcon : OutlineIcon;

            return (
              <ListItem key={item.link} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip
                  title={!isMobile && !openDrawer ? item.title : ""}
                  placement="right"
                >
                  <ListItemButton
                    component={Link}
                    to={item.link}
                    onClick={() => {
                      setActiveLink(item.link);
                      localStorage.setItem("activeSidebarLink", item.link);
                      if (isMobile) setMobileDrawerOpen(!mobileDrawerOpen);
                    }}
                    sx={{
                      borderRadius: 2.5,
                      justifyContent:
                        isMobile || openDrawer ? "flex-start" : "center",
                      px: isMobile || openDrawer ? 2 : 1.5,
                      py: 1.1,
                      background: active
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        : "transparent",
                      boxShadow: active
                        ? `0 6px 16px -4px ${theme.palette.primary.main}66`
                        : "none",
                      "&:hover": {
                        background: active
                          ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                          : sidebarTokens.hover,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isMobile || openDrawer ? 36 : "auto",
                        color: active
                          ? sidebarTokens.onActiveItem
                          : sidebarTokens.textInactive,
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    {(isMobile || openDrawer) && (
                      <ListItemText
                        primary={item.title}
                        sx={{
                          whiteSpace: "nowrap",
                          "& .MuiListItemText-primary": {
                            fontWeight: active ? 700 : 500,
                            fontSize: "0.875rem",
                            color: active
                              ? sidebarTokens.onActiveItem
                              : sidebarTokens.textInactive,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ borderColor: sidebarTokens.border, mx: 2, mb: 1.5 }} />

        <Box sx={{ px: 1.5, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderRadius: 2.5,
              p: isMobile || openDrawer ? 1.25 : 1,
              justifyContent: isMobile || openDrawer ? "flex-start" : "center",
              background: sidebarTokens.hover,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.875rem",
                bgcolor: "primary.main",
              }}
            >
              {(user?.userRole ?? "A").charAt(0).toUpperCase()}
            </Avatar>
            {(isMobile || openDrawer) && (
              <>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={{ fontSize: "0.8125rem", fontWeight: 600, color: sidebarTokens.textActive }}
                  >
                    {user?.userRole ?? "Admin"}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: "0.6875rem", color: sidebarTokens.textInactive }}>
                    FRESH Ecommerce
                  </Typography>
                </Box>
                <Tooltip title="Logout">
                  <IconButton
                    size="small"
                    onClick={() => {
                      removeToken();
                      navigate("/");
                      window.location.reload();
                    }}
                    sx={{ color: sidebarTokens.textInactive }}
                  >
                    <LogoutRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {!isMobile && (
            <IconButton
              onClick={() => setOpenDrawer(!openDrawer)}
              sx={{
                mt: 1.5,
                width: "100%",
                borderRadius: 2.5,
                color: sidebarTokens.textInactive,
                "&:hover": { background: sidebarTokens.hover },
              }}
            >
              {openDrawer ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
            </IconButton>
          )}
        </Box>
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
