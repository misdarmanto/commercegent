"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useTranslation } from "react-i18next";
import { useChatRecommendations } from "@/lib/api/chat";
import { ProductCard } from "@/components/product/ProductCard";
import { AUTH_CHANGED_EVENT, isLoggedIn } from "@/lib/auth/token";

/**
 * "Recommended for you": products re-derived from the customer's most
 * recent chat conversation. Renders nothing while loading or when there's
 * no chat history to base a recommendation on (guests, or a customer who
 * has never used the chat) — HighlightedProducts already covers the
 * general-purpose fallback on the homepage.
 */
export function RecommendedProducts() {
  const { t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  const { data, isLoading } = useChatRecommendations();
  const items = data?.products ?? [];

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

  if (!loggedIn || isLoading || items.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {t("home.recommendedTitle")}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: "auto",
          pb: 1,
          "& > *": { flex: "0 0 auto", width: { xs: 150, sm: 190 } },
        }}
      >
        {items.map((product) => (
          <Box key={product.productId}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
