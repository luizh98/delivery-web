import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
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

export const MetricsGrid = styled("section", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
});

export const LinksGrid = styled("section", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },

  "@lg": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
});

export const LinkCard = styled("a", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
  fontWeight: 600,

  "&:hover": {
    borderColor: "var(--color-primary)",
  },
});

export const LinkIcon = styled("span", {
  color: "var(--color-primary)",
});

export const MetricRoot = styled("div", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const MetricLabel = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const MetricValue = styled("p", {
  marginTop: "0.25rem",
  fontSize: "1.5rem",
  fontWeight: 700,
});
