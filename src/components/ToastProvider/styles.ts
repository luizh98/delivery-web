import { styled } from "styles";

export const Viewport = styled("div", {
  pointerEvents: "none",
  position: "fixed",
  left: "1rem",
  right: "1rem",
  top: "1rem",
  zIndex: 50,
  display: "grid",
  gap: "0.5rem",

  "@sm": {
    left: "auto",
    width: "24rem",
  },
});

export const ToastRoot = styled("div", {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid",
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

  variants: {
    variant: {
      error: {
        borderColor: "#fecaca",
        background: "#fef2f2",
        color: "#7f1d1d",
        boxShadow: "0 0 0 1px #fee2e2, 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
      success: {
        borderColor: "#bbf7d0",
        background: "#f0fdf4",
        color: "#14532d",
        boxShadow: "0 0 0 1px #dcfce7, 0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
    },
  },
});

export const IconWrap = styled("span", {
  marginTop: "0.125rem",
  flexShrink: 0,

  variants: {
    variant: {
      error: {
        color: "#dc2626",
      },
      success: {
        color: "#16a34a",
      },
    },
  },
});
