import React, { useEffect, useState } from "react";
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
  Stack,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/app.context";
import { useToken } from "../hooks/token";
import { IconMenus } from "../components/icon";
import logo from "../assets/logo.webp";

const drawerWidth = 240;
const palette = {
  greenDark: "#1F6F5F",
  greenPrimary: "#2FA084",
  greenSoft: "#6FCF97",
  grayLight: "#EEEEEE",
} as const;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  backdropFilter: "blur(14px)",
  background: "rgba(255, 255, 255, 0.82)",
  color: palette.greenPrimary,
  borderBottom: `2px solid ${palette.greenPrimary}20`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      color: palette.greenDark,
      borderRight: "none",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      background: palette.grayLight,
      color: palette.greenDark,
      borderRight: "none",
      boxShadow: "4px 0 20px rgba(0,0,0,0.05)",
    },
  }),
}));

export default function AppLayout() {
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(true);
  const { appAlert, setAppAlert, isLoading, setIsLoading } = useAppContext();
  const { removeToken } = useToken();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [activeLink, setActiveLink] = useState("/");

  type MenuType = {
    title: string;
    link: string;
    icon: any;
  };

  const menuItems: MenuType[] = [];

  const adminMenus: MenuType[] = [
    { title: "Dashboard", link: "/", icon: <IconMenus.dashboard /> },
    { title: "Products", link: "/products", icon: <IconMenus.products /> },
    {
      title: "Promo",
      link: "/promotions",
      icon: <IconMenus.promotion />,
    },
    { title: "Category", link: "/categories", icon: <IconMenus.category /> },
    { title: "Uploads", link: "/uploads", icon: <IconMenus.upload /> },
    { title: "Customers", link: "/customers", icon: <IconMenus.customers /> },
    { title: "Orders", link: "/orders", icon: <IconMenus.orders /> },
    {
      title: "Transactions",
      link: "/transactions",
      icon: <IconMenus.transaction />,
    },
  ];

  const superAdminMenus: MenuType[] = [
    ...adminMenus,
    {
      title: "Admins",
      link: "/admins",
      icon: <IconMenus.admin />,
    },
    { title: "Settings", link: "/settings", icon: <IconMenus.settings /> },
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
    icon: <IconMenus.profile />,
  });

  const handleDrawer = () => setOpenDrawer(!openDrawer);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  useEffect(() => {
    const savedLink = localStorage.getItem("activeSidebarLink");
    if (savedLink) setActiveLink(savedLink);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* === APP BAR === */}
      <AppBar position="fixed" open={openDrawer}>
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: 64,
            }}
          >
            {/* LOGO + TITLE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ml: openDrawer ? 0 : 5,
              }}
            >
              <img
                src={logo}
                width={40}
                height={40}
                style={{ borderRadius: 8 }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  ml: 1.5,
                  fontWeight: 700,
                  letterSpacing: ".1rem",
                  color: palette.greenPrimary,
                }}
              >
                FRESH
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* USER MENU */}
            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenUserMenu} size="large">
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate("/my-profile");
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
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

      {/* === SIDEBAR === */}
      <Drawer variant="permanent" open={openDrawer}>
        <DrawerHeader>
          <IconButton onClick={handleDrawer} sx={{ color: palette.greenDark }}>
            {theme.direction === "rtl" || openDrawer ? (
              <ChevronLeft />
            ) : (
              <ChevronRight />
            )}
          </IconButton>
        </DrawerHeader>

        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.link}
              disablePadding
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor:
                  activeLink === item.link
                    ? palette.greenPrimary
                    : "transparent",
                transition: "all 0.25s ease",
                "&:hover": {
                  backgroundColor:
                    activeLink === item.link
                      ? palette.greenPrimary
                      : palette.greenSoft,
                  transform: "translateX(4px)",
                },
                position: "relative",
              }}
              onClick={() => {
                setActiveLink(item.link);
                localStorage.setItem("activeSidebarLink", item.link);
              }}
            >
              <Link
                to={item.link}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  width: "100%",
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 46,
                    justifyContent: openDrawer ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: openDrawer ? 2.5 : "auto",
                      justifyContent: "center",
                      color:
                        activeLink === item.link
                          ? palette.grayLight
                          : palette.greenDark,
                      opacity: activeLink === item.link ? 1 : 0.9,
                    }}
                  >
                    {/* IconMenus should render an SVG or component */}
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      opacity: openDrawer ? 1 : 0,
                      fontWeight: activeLink === item.link ? 700 : 500,
                      color:
                        activeLink === item.link
                          ? palette.grayLight
                          : palette.greenDark,
                    }}
                  />
                </ListItemButton>
                {/* Active indicator (left bar) */}
                {activeLink === item.link && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 4,
                      top: 8,
                      bottom: 8,
                      width: 4,
                      bgcolor: palette.grayLight,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Link>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* === MAIN CONTENT === */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <DrawerHeader />
        {isLoading ? (
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
            open={isLoading}
            onClick={() => setIsLoading(false)}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : (
          <Outlet />
        )}
        <Stack direction="row" justifyContent="flex-end">
          <Snackbar
            open={appAlert?.isDisplayAlert ?? false}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={5000}
            onClose={() =>
              setAppAlert({
                isDisplayAlert: false,
                message: "",
                alertType: undefined,
              })
            }
          >
            <Alert severity={appAlert?.alertType} sx={{ bgcolor: "#fff" }}>
              <AlertTitle sx={{ textTransform: "uppercase" }}>
                {appAlert?.alertType}
              </AlertTitle>
              {appAlert?.message}
            </Alert>
          </Snackbar>
        </Stack>
      </Box>
    </Box>
  );
}
