import { styled } from "styles";

export const BackButtonRoot = styled("button", {
  display: "grid",
  width: "2.75rem",
  height: "2.75rem",
  flexShrink: 0,
  placeItems: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "9999px",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  transition: "background 150ms ease",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },
});
