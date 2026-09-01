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

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const PaneGrid = styled("div", {
  display: "grid",
  gap: "1rem",

  "@lg": {
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
  },
});

export const Section = styled("section", {
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const SectionHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const SectionTitle = styled("h2", {
  fontSize: "0.95rem",
  fontWeight: 700,
});

export const SectionHelp = styled("p", {
  maxWidth: "38rem",
  fontSize: "0.75rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const Form = styled("form", {
  display: "grid",
  gap: "0.75rem",
});

export const GridTwo = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const CheckboxLabel = styled("label", {
  display: "flex",
  height: "2.75rem",
  alignItems: "center",
  alignSelf: "end",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  fontWeight: 500,

  input: {
    accentColor: "var(--color-primary)",
  },
});

export const Actions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-background)",
  padding: "1rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const List = styled("div", {
  display: "grid",
  maxHeight: "30rem",
  gap: "0.5rem",
  overflowY: "auto",
  paddingRight: "0.25rem",
});

export const Card = styled("article", {
  display: "grid",
  gap: "0.65rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const CardHeader = styled("header", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",

  svg: {
    color: "var(--color-primary)",
  },
});

export const CardTitle = styled("p", {
  overflowWrap: "anywhere",
  fontWeight: 600,
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const RoleBadge = styled("span", {
  display: "inline-flex",
  marginRight: "0.4rem",
  borderRadius: "999px",
  background: "#e2e8f0",
  padding: "0.2rem 0.55rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#334155",

  "&[data-admin='true']": {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
});

export const StatusBadge = styled("span", {
  display: "inline-flex",
  borderRadius: "999px",
  background: "#fee2e2",
  padding: "0.2rem 0.55rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#b91c1c",

  "&[data-active='true']": {
    background: "#dcfce7",
    color: "#15803d",
  },
});

export const CardActions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
});
