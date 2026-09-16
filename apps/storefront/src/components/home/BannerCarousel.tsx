"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { useBanners } from "@/lib/api/banners";
import { getImageUrl } from "@/lib/utils/getImageUrl";

const AUTO_ROTATE_MS = 5000;

export function BannerCarousel() {
  const { t } = useTranslation();
  const { data, isLoading } = useBanners();
  const banners = data?.items ?? [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
       
      setActive((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading) {
    return (
      <Skeleton
        variant="rounded"
        sx={{ width: "100%", aspectRatio: "16 / 6", mb: 3 }}
      />
    );
  }

  if (banners.length === 0) return null;

  const goTo = (index: number) => {
    setActive((index + banners.length) % banners.length);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: { xs: "16 / 9", sm: "16 / 6" },
        borderRadius: 2,
        overflow: "hidden",
        mb: 3,
        bgcolor: "action.hover",
      }}
    >
      {banners.map((banner, index) => (
        <Box
          key={banner.bannerId}
          component="img"
          src={getImageUrl(banner.bannerImage)}
          alt={`Banner ${index + 1}`}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: index === active ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      ))}

      {banners.length > 1 && (
        <>
          <IconButton
            aria-label={t("common.previous")}
            onClick={() => goTo(active - 1)}
            sx={{
              position: "absolute",
              top: "50%",
              left: 8,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.paper" },
            }}
            size="small"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={t("common.next")}
            onClick={() => goTo(active + 1)}
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.paper" },
            }}
            size="small"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.75,
            }}
          >
            {banners.map((banner, index) => (
              <Box
                key={banner.bannerId}
                onClick={() => goTo(index)}
                sx={{
                  width: index === active ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: index === active ? "primary.main" : "background.paper",
                  cursor: "pointer",
                  transition: "width 0.3s ease",
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
