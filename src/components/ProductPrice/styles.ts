import { styled } from "styles";

export const PriceRow = styled("span", {
  display: "inline-flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.375rem 0.5rem",
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1.5,
  "&[data-discounted]": {
    color: "var(--color-primary)",
  },
});

export const OriginalPrice = styled("del", {
  color: "var(--color-muted)",
  fontSize: "0.8125rem",
  fontWeight: 500,
  textDecorationThickness: "1px",
  whiteSpace: "nowrap",
});

export const SalePrice = styled("span", {
  fontWeight: 800,
  whiteSpace: "nowrap",
});

export const DiscountBadge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  borderRadius: "0.375rem",
  padding: "0.1875rem 0.4375rem",
  background: "color-mix(in srgb, var(--color-secondary) 30%, var(--color-surface))",
  color: "var(--color-primary)",
  fontSize: "0.6875rem",
  fontWeight: 800,
  whiteSpace: "nowrap",
});
