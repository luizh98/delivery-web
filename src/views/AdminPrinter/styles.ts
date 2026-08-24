import { styled } from "styles";

export const Root = styled("main", {
  display: "grid",
  gap: "1rem",
  width: "100%",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Panel = styled("section", {
  display: "grid",
  gap: "1rem",
  padding: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
});

export const Status = styled("p", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "fit-content",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const StatusDot = styled("span", {
  width: "0.625rem",
  height: "0.625rem",
  borderRadius: "999px",
  background: "#dc2626",

  variants: {
    connected: {
      true: { background: "#16a34a" },
    },
  },
});

export const Actions = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const Help = styled("p", {
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});
