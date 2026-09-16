import { useState } from "react";
import { Box, Menu, MenuItem, Button, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../i18n";

const LANGUAGES = [
  { code: "id", flag: "🇮🇩" },
  { code: "en", flag: "🇬🇧" },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current = LANGUAGES.find((lang) => lang.code === i18n.language) ?? LANGUAGES[0];

  const changeLanguage = (code: "id" | "en") => {
    i18n.changeLanguage(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ minWidth: 0, px: 1.25, fontWeight: 700, color: "text.secondary" }}
      >
        {current.flag}&nbsp;{current.code.toUpperCase()}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === i18n.language}
            onClick={() => changeLanguage(lang.code)}
          >
            <ListItemText>
              {lang.flag}&nbsp;&nbsp;{t(`language.${lang.code}`)}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
