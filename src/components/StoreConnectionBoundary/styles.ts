import { styled } from "styles";

export const ConnectionRoot = styled("main", {
  display: "grid",
  minHeight: "100svh",
  placeItems: "center",
  padding: "2rem 1.5rem",
  background: "var(--color-background)",
  color: "var(--color-foreground)",
});

export const ConnectionContent = styled("div", {
  display: "flex",
  width: "100%",
  maxWidth: "26rem",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
  textAlign: "center",
});

export const ConnectionIcon = styled("div", {
  display: "grid",
  width: "4.5rem",
  height: "4.5rem",
  placeItems: "center",
  borderRadius: "50%",
  background: "var(--color-surface-muted)",
  color: "var(--color-muted)",
});

export const ConnectionTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
  lineHeight: 1.3,
});

export const ConnectionText = styled("p", {
  color: "var(--color-muted)",
  fontSize: "1rem",
  lineHeight: 1.6,
});
