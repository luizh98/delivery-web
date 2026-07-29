import { styled } from "styles";

export const Root = styled("section", {
  display: "grid",
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
});

export const Title = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const List = styled("div", {
  display: "grid",
  gap: "0.5rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const Card = styled("article", {
  display: "grid",
  gridTemplateColumns: "3.5rem minmax(0, 1fr)",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const Image = styled("div", {
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "0.375rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const Content = styled("div", {
  display: "grid",
  minWidth: 0,
  gap: "0.35rem",
});

export const Name = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 700,
});

export const PriceRow = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "0.4rem",
});

export const OriginalPrice = styled("span", {
  color: "var(--color-muted)",
  fontSize: "0.75rem",
  textDecoration: "line-through",
});

export const OfferPrice = styled("strong", {
  color: "var(--color-primary)",
  fontSize: "0.95rem",
});

export const Savings = styled("p", {
  color: "#15803d",
  fontSize: "0.72rem",
  fontWeight: 600,
});

export const Notice = styled("p", {
  border: "1px solid #fde68a",
  borderRadius: "0.375rem",
  background: "#fffbeb",
  color: "#92400e",
  padding: "0.65rem",
  fontSize: "0.8rem",
});
