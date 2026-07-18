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
});

export const SectionHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const SectionTitle = styled("h3", {
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const SectionHelp = styled("p", {
  fontSize: "0.75rem",
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

export const SearchLabel = styled("label", {
  display: "grid",
  gap: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
});

export const SearchWrap = styled("span", {
  position: "relative",

  input: {
    width: "100%",
    paddingLeft: "2.25rem",
  },
});

export const SearchIcon = styled("span", {
  pointerEvents: "none",
  position: "absolute",
  left: "0.75rem",
  top: "50%",
  color: "var(--color-muted)",
  transform: "translateY(-50%)",
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const List = styled("div", {
  display: "grid",
  maxHeight: "22rem",
  gap: "0.5rem",
  overflowY: "auto",
  paddingRight: "0.25rem",
});

export const Card = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const CardTitle = styled("p", {
  fontWeight: 600,
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const CardActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
});
