"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useCartTotal } from "@/lib/api/cart";
import { AUTH_CHANGED_EVENT, isLoggedIn } from "@/lib/auth/token";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const { data: cartTotal } = useCartTotal();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, unavailable during SSR
    setLoggedIn(isLoggedIn());

    const handleAuthChange = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 800,
            textDecoration: "none",
            color: "primary.main",
            flexGrow: 1,
          }}
        >
          {t("app.name")}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LanguageSwitcher />

          {loggedIn ? (
            <IconButton component={Link} href="/profile">
              <PersonOutlineIcon />
            </IconButton>
          ) : (
            <Button component={Link} href="/login" variant="outlined" size="small">
              {t("nav.login")}
            </Button>
          )}

          <IconButton component={Link} href="/cart">
            <Badge badgeContent={cartTotal?.total ?? 0} color="primary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
