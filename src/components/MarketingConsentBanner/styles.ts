import { styled } from "styles";

export const BannerRoot = styled("aside", {
  position: "fixed",
  right: "1rem",
  bottom: "1rem",
  zIndex: 100,
  width: "min(26rem, calc(100vw - 2rem))",
  padding: "1.25rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  boxShadow: "0 1rem 3rem rgb(15 23 42 / 0.18)",
  "@bp2": {
    right: 0,
    bottom: 0,
    width: "100%",
    borderRadius: "0.75rem 0.75rem 0 0",
  },
});

export const BannerTitle = styled("h2", {
  margin: 0,
  fontSize: "1rem",
  lineHeight: 1.4,
  fontWeight: 700,
});

export const BannerText = styled("p", {
  margin: "0.5rem 0 0",
  color: "var(--color-muted)",
  fontSize: "0.875rem",
  lineHeight: 1.55,
});

export const BannerActions = styled("div", {
  display: "flex",
  gap: "0.625rem",
  marginTop: "1rem",
  "@bp2": {
    flexDirection: "column-reverse",
  },
});

export const PreferencesButton = styled("button", {
  position: "fixed",
  right: "1rem",
  bottom: "1rem",
  zIndex: 99,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "2.5rem",
  padding: "0.625rem 0.875rem",
  border: "1px solid var(--color-border)",
  borderRadius: "999px",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  boxShadow: "0 0.5rem 1.5rem rgb(15 23 42 / 0.14)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  "&:hover": {
    background: "var(--color-surface-muted)",
  },
  "@bp2": {
    right: "0.75rem",
    bottom: "4.5rem",
  },
});
