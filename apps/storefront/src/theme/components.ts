import { Components, Theme } from "@mui/material/styles";

// Mirrors apps/dashboard/src/theme/components.ts (minus the DataGrid
// overrides, which only the dashboard uses) so both apps share the same
// component look and feel.
export function getComponents(theme: Theme): Components<Omit<Theme, "components">> {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "*::-webkit-scrollbar": { width: 8, height: 8 },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.grey[300],
          borderRadius: 8,
        },
        "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          paddingInline: 18,
          paddingBlock: 9,
        },
        outlined: {
          borderColor: theme.palette.divider,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.lighter,
          },
        },
        sizeSmall: { paddingInline: 12, paddingBlock: 6 },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: { "&:hover": { boxShadow: "0 8px 20px -6px rgba(15,155,142,0.45)" } },
        },
      ],
    },

    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: theme.palette.grey[50],
          "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
          },
        },
        input: { padding: "12px 14px" },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "0.9rem" },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: theme.palette.divider },
        elevation1: {
          boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: theme.spacing(3), "&:last-child": { paddingBottom: theme.spacing(3) } },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        sizeSmall: { fontSize: "0.75rem" },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: theme.palette.divider },
        head: {
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.04em",
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.grey[50],
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.grey[900],
          borderRadius: 8,
          fontSize: "0.75rem",
          padding: "6px 10px",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 12px 32px -8px rgba(15,23,42,0.18)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: 8, marginInline: 6, marginBlock: 1 },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 18 },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },

    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: { fontWeight: 600, color: theme.palette.secondary.main },
      },
    },
  };
}
