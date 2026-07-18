import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",
});

export const Toolbar = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-surface)",
  padding: "1.5rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const List = styled("section", {
  display: "grid",
  gap: "0.75rem",
});

export const Card = styled("article", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const CardGrid = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@lg": {
    gridTemplateColumns: "1fr 280px",
  },
});

export const OrderInfo = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const OrderHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
});

export const CustomerName = styled("h2", {
  fontWeight: 700,
});

export const StatusBadge = styled("span", {
  borderRadius: "0.375rem",
  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-primary)",
});

export const MutedTiny = styled("span", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const MutedText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ItemList = styled("div", {
  display: "grid",
  gap: "0.25rem",
});

export const Item = styled("p", {
  fontSize: "0.875rem",
});

export const Total = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const ActionsPanel = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const ButtonRow = styled("div", {
  display: "flex",
  gap: "0.5rem",
});

export const CancelBox = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const PrintSection = styled("section", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const PrintTitle = styled("h2", {
  fontWeight: 700,
});

export const PrintBody = styled("pre", {
  marginTop: "0.75rem",
  overflow: "auto",
  whiteSpace: "pre-wrap",
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  fontSize: "0.875rem",
});
