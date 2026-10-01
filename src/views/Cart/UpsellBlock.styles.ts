import { styled } from "styles";

export const Root = styled("section", {
  display: "grid",
  minWidth: 0,
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
  marginBottom: "1rem",
});

export const Title = styled("h2", {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  minWidth: 0,
  fontSize: "1rem",
  fontWeight: 700,

  svg: { flexShrink: 0, color: "var(--color-primary)" },
});

export const Track = styled("div", {
  display: "flex",
  minWidth: 0,
  gap: "0.75rem",
  overflowX: "auto",
  overscrollBehaviorX: "contain",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "-2px",
  },

  "&::-webkit-scrollbar": { display: "none" },
});

export const Card = styled("article", {
  display: "grid",
  flex: "0 0 min(55%, 10.5rem)",
  minWidth: 0,
  gridTemplateRows: "5rem 1fr",
  gap: "0.5rem",
  scrollSnapAlign: "start",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  background: "var(--color-background)",
  padding: "0.5rem",
});

export const ImageFrame = styled("div", {
  position: "relative",
  width: "100%",
  height: "5rem",
  overflow: "hidden",
  borderRadius: "0.5rem",
  backgroundColor: "var(--color-surface-muted)",
});

export const ImagePhoto = styled("div", {
  position: "absolute",
  inset: 0,
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const AddButton = styled("button", {
  position: "absolute",
  right: "0.375rem",
  bottom: "0.375rem",
  display: "grid",
  width: "2.75rem",
  height: "2.75rem",
  placeItems: "center",
  border: "1px solid var(--color-primary)",
  borderRadius: "50%",
  background: "var(--color-primary)",
  color: "#ffffff",
  boxShadow: "0 2px 8px rgb(0 0 0 / 0.22)",
  cursor: "pointer",

  "&:hover:not(:disabled)": { filter: "brightness(0.92)" },
  "&:focus-visible": {
    outline: "2px solid #ffffff",
    outlineOffset: "2px",
  },
  "&:disabled": { opacity: 0.65, cursor: "wait" },
});

export const Content = styled("div", {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  gap: "0.35rem",
});

export const Name = styled("p", {
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  fontSize: "0.8125rem",
  fontWeight: 700,
  lineHeight: 1.3,
  overflowWrap: "anywhere",
});

export const PriceBlock = styled("div", {
  display: "grid",
  gap: "0.125rem",
  marginTop: "auto",
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
