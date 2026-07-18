import { styled } from "styles";

export const ButtonRoot = styled("button", {
  display: "inline-flex",
  height: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  padding: "0 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  transition: "all 150ms ease",

  "&:disabled": {
    opacity: 1,
  },

  variants: {
    variant: {
      primary: {
        background: "color-mix(in srgb, var(--color-primary) 82%, black)",
        color: "#ffffff",
        boxShadow: "0 1px 2px rgb(0 0 0 / 0.05), 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",

        "&:hover": {
          background: "color-mix(in srgb, var(--color-primary) 72%, black)",
        },

        "&:active": {
          filter: "brightness(0.95)",
        },

        "&:disabled": {
          filter: "brightness(1)",
          background: "var(--color-surface-muted)",
          color: "var(--color-muted)",
          boxShadow: "none",
          borderColor: "transparent",
        },
      },
      secondary: {
        background: "var(--color-secondary)",
        color: "#ffffff",

        "&:hover": {
          opacity: 0.9,
        },
      },
      outline: {
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-foreground)",

        "&:hover": {
          background: "var(--color-surface-muted)",
        },
      },
      ghost: {
        color: "var(--color-foreground)",

        "&:hover": {
          background: "var(--color-surface-muted)",
        },
      },
      danger: {
        background: "#dc2626",
        color: "#ffffff",

        "&:hover": {
          background: "#b91c1c",
        },
      },
      dangerGhost: {
        height: "2.25rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        color: "#dc2626",

        "&:hover": {
          background: "#fef2f2",
        },
      },
      dangerText: {
        color: "#dc2626",

        "&:hover": {
          background: "#fef2f2",
        },
      },
    },
  },
});
