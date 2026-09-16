"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import { useTranslation } from "react-i18next";
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from "@/i18n";

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: "🇬🇧",
  id: "🇮🇩",
};

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current = (i18n.language as SupportedLanguage) ?? "en";

  const changeLanguage = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={t("language.label")}
        sx={{ minWidth: 0, px: 1.25, fontWeight: 700, color: "text.secondary" }}
      >
        {LANGUAGE_FLAGS[current]}&nbsp;{current.toUpperCase()}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {SUPPORTED_LANGUAGES.map((code) => (
          <MenuItem key={code} selected={code === current} onClick={() => changeLanguage(code)}>
            <ListItemText>
              {LANGUAGE_FLAGS[code]}&nbsp;&nbsp;{t(`language.${code}`)}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
