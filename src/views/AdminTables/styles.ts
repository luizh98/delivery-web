import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  minWidth: 0,
  gap: "1rem",

  "& button": {
    minWidth: 0,
    minHeight: "2.75rem",
    height: "auto",
    padding: "0.625rem 0.75rem",
    "& svg": { flexShrink: 0 },
  },

  "& button:focus-visible, & input:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },
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
  overflowWrap: "anywhere",
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const PaneGrid = styled("div", {
  display: "grid",
  minWidth: 0,
  alignItems: "start",
  gap: "1.5rem",

  "@lg": {
    gridTemplateColumns: "minmax(16rem, 20rem) minmax(0, 1fr)",
  },
});

export const Section = styled("section", {
  display: "grid",
  minWidth: 0,
  gap: "0.75rem",
});

export const SectionHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",

  "& > div": {
    flex: "1 1 12rem",
    minWidth: 0,
  },
});

export const SectionTitle = styled("h2", {
  overflowWrap: "anywhere",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const SectionHelp = styled("p", {
  overflowWrap: "anywhere",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const Form = styled("form", {
  display: "grid",
  minWidth: 0,
  gap: "0.75rem",

  "& label, & input": { minWidth: 0 },
  "& input:not([type='checkbox'])": { width: "100%", fontSize: "1rem" },
});

export const CheckboxLabel = styled("label", {
  display: "flex",
  minHeight: "2.75rem",
  alignItems: "center",
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
  minWidth: 0,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",

  "& > button": { flex: "1 1 9rem" },
});

export const LinkResult = styled("section", {
  display: "grid",
  minWidth: 0,
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const LinkInput = styled("input", {
  minWidth: 0,
  width: "100%",
  borderRadius: "0.25rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.625rem 0.75rem",
  color: "var(--color-foreground)",
  fontFamily: "monospace",
  fontSize: "1rem",
});

export const QrCodePreview = styled("div", {
  display: "grid",
  minWidth: 0,
  justifyItems: "center",
});

export const QrCodeImage = styled("img", {
  display: "block",
  width: "min(100%, 16rem)",
  height: "auto",
  imageRendering: "pixelated",
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
  minWidth: 0,
  gap: "0.75rem",
});

export const TableCard = styled("article", {
  display: "grid",
  minWidth: 0,
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const TableIdentity = styled("div", {
  display: "flex",
  minWidth: 0,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const TableName = styled("h3", {
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  fontSize: "1rem",
  fontWeight: 600,
});

export const Status = styled("span", {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  gap: "0.375rem",
  borderRadius: "999px",
  padding: "0.125rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,

  variants: {
    active: {
      true: {
        background: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
        color: "var(--color-primary-text)",
      },
      false: {
        background: "var(--color-surface)",
        color: "var(--color-muted)",
      },
    },
  },
});

export const CardActions = styled("div", {
  display: "flex",
  minWidth: 0,
  flexWrap: "wrap",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",

  "& > button": { flex: "1 1 9rem" },
});
