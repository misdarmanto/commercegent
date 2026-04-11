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

const drawerWidth = 200;
const miniDrawerWidth = 64;

const primaryBlue = "#1F6F5F";
const glowBlue = "#2FA084";

const tokens = {
  dark: {
    appBg:
      "radial-gradient(1200px 600px at 10% -10%, rgba(56,189,248,0.06), transparent 45%), #020617",
    sidebar: "linear-gradient(180deg, #020617 0%, #020617 60%, #020617 100%)",
    surface:
      "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))",
    border: "rgba(148,163,184,0.28)",
    hover: "rgba(15,23,42,0.9)",
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
  },

  light: {
    appBg: "#F5F7FB",
    sidebar: "linear-gradient(180deg, #FFFFFF, #F1F5F9)",
    surface: "#FFFFFF",
    border: "rgba(0,0,0,0.08)",
    hover: "rgba(0,0,0,0.04)",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
  },
};

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
  const t = tokens[theme.palette.mode];

  return {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    ...(open ? openedMixin(theme) : closedMixin(theme)),

    "& .MuiDrawer-paper": {
      background: t.sidebar,
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
    { title: "Products", link: "/products", iconKey: "products" as const },
    {
      title: "Promo",
      link: "/promotions",
      iconKey: "promotion" as const,
    },
    { title: "Category", link: "/categories", iconKey: "category" as const },
    { title: "Uploads", link: "/uploads", iconKey: "upload" as const },
    { title: "Customers", link: "/customers", iconKey: "customers" as const },
    { title: "Orders", link: "/orders", iconKey: "orders" as const },
    {
      title: "Transactions",
      link: "/transactions",
      iconKey: "transaction" as const,
    },
  ];

  const superAdminMenus = [
    ...adminMenus,
    {
      title: "Admins",
      link: "/admins",
      iconKey: "admin" as const,
    },
    { title: "Settings", link: "/settings", iconKey: "settings" as const },
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
    title: "Profile",
    link: "/my-profile",
    iconKey: "profile" as const,
  });

  useEffect(() => {
    const saved = localStorage.getItem("activeSidebarLink");
    if (saved) setActiveLink(saved);
  }, []);

  const t = tokens[theme.palette.mode];

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
                  background: `linear-gradient(90deg, ${primaryBlue}, ${glowBlue})`,
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
                    bgcolor: primaryBlue,
                    boxShadow: `0 0 0 4px rgba(59,130,246,0.25)`,
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
                  mb: 0.2,
                  borderRadius: 2.5,
                  background: active ? "rgba(59,130,246,0.12)" : "transparent",
                  "&:hover": {
                    background: active ? "rgba(59,130,246,0.16)" : t.hover,
                  },
                }}
                onClick={() => {
                  setActiveLink(item.link);
                  localStorage.setItem("activeSidebarLink", item.link);
                  if (isMobile) setMobileDrawerOpen(!mobileDrawerOpen);
                }}
              >
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: active ? primaryBlue : t.textSecondary,
                    }}
                  >
                    {(() => {
                      const { outline: OutlineIcon, fill: FillIcon } =
                        IconMenusSidebar[item.iconKey];
                      const Icon = active ? OutlineIcon : FillIcon;
                      return <Icon />;
                    })()}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      fontWeight: active ? 900 : 700,
                      color: active ? t.textPrimary : t.textSecondary,
                    }}
                  />
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
