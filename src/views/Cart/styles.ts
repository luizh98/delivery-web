import { styled } from "styles";

export const CartPageHeader = styled("header", {
  display: "grid",
  gap: "0.5rem",
  marginBottom: "1rem",
});

export const CartPageTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const CartPageText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const CartPageContent = styled("section", {
  width: "100%",
  maxWidth: "48rem",
  margin: "0 auto",
});
