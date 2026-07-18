import { styled } from "styles";

export const Overlay = styled("div", {
  position: "fixed",
  inset: 0,
  zIndex: 40,
  display: "grid",
  placeItems: "center",
  background: "rgb(0 0 0 / 0.4)",
  padding: "0 1rem",
});

export const Dialog = styled("div", {
  display: "grid",
  width: "100%",
  maxWidth: "28rem",
  gap: "1rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1.25rem",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
});

export const Header = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const IconWrap = styled("span", {
  marginTop: "0.125rem",
  flexShrink: 0,
  color: "#dc2626",
});

export const Copy = styled("div", {
  display: "grid",
  gap: "0.25rem",
});

export const Title = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const Message = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Actions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
});
