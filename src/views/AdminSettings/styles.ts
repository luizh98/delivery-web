import { styled } from "styles";

export const Form = styled("form", {
  display: "grid",
  maxWidth: "48rem",
  gap: "1rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Section = styled("section", {
  display: "grid",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const GridTwo = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});
