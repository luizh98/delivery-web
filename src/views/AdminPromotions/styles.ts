import { styled } from "styles";

export const Root = styled("div", { display: "grid", gap: "1rem" });

export const PageHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const PageTitle = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });

export const PageSubtitle = styled("p", {
  color: "var(--color-muted)",
  fontSize: "0.875rem",
});

export const FormCard = styled("section", {
  display: "grid",
  gap: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const Grid = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": { gridTemplateColumns: "minmax(0, 1fr) minmax(12rem, 0.4fr)" },
});

export const Checkbox = styled("label", {
  display: "flex",
  minHeight: "2.5rem",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.82rem",

  input: { accentColor: "var(--color-primary)" },
});

export const ProductPicker = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
});

export const ComboItem = styled("div", {
  display: "grid",
  alignItems: "center",
  gap: "0.5rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-background)",
  padding: "0.65rem",

  "@sm": { gridTemplateColumns: "minmax(0, 1fr) 7rem auto" },
});

export const ComboList = styled("div", { display: "grid", gap: "0.5rem" });

export const ComboCard = styled("article", {
  display: "grid",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
  padding: "0.875rem",

  "@md": { gridTemplateColumns: "minmax(0, 1fr) auto" },
});

export const ComboName = styled("h2", { fontSize: "1rem", fontWeight: 700 });

export const ComboMeta = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem 0.75rem",
  marginTop: "0.35rem",
  color: "var(--color-muted)",
  fontSize: "0.75rem",
});

export const Actions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.4rem",
});

export const FormActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
});

export const Status = styled("span", {
  border: "1px solid",
  borderRadius: "3px",
  padding: "0.1rem 0.35rem",
  fontSize: "0.7rem",
  fontWeight: 600,

  variants: {
    active: {
      true: { borderColor: "#bbf7d0", background: "#f0fdf4", color: "#15803d" },
      false: { borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" },
    },
  },
});

export const Empty = styled("div", {
  border: "1px dashed var(--color-border)",
  borderRadius: "0.375rem",
  padding: "1rem",
  color: "var(--color-muted)",
  fontSize: "0.875rem",
});

export const ErrorText = styled("p", { color: "#dc2626", fontSize: "0.8rem" });
