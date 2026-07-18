import { styled } from "styles";

export const Root = styled("main", {
  display: "grid",
  minHeight: "100vh",
  placeItems: "center",
  padding: "0 1rem",
});

export const Form = styled("form", {
  display: "grid",
  width: "100%",
  maxWidth: "24rem",
  gap: "1rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1.25rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});
