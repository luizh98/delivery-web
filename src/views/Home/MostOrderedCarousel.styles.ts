import { styled } from "styles";

export const CarouselSection = styled("section", {
  minWidth: 0,
  marginTop: "0.5rem",
  marginBottom: "1rem",
  borderRadius: "1rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
});

export const CarouselHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  marginBottom: "0.75rem",
});

export const CarouselHeading = styled("div", {
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: "0.625rem",

  svg: {
    flexShrink: 0,
    color: "var(--color-primary-text)",
  },
});

export const CarouselTitle = styled("h2", {
  fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
  fontWeight: 800,
  lineHeight: 1.2,
  color: "var(--color-foreground)",
});

export const CarouselTrack = styled("div", {
  display: "flex",
  minWidth: 0,
  gap: "0.75rem",
  overflowX: "auto",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  overscrollBehaviorX: "contain",
  userSelect: "none",

});

export const CarouselCard = styled("button", {
  display: "grid",
  flex: "0 0 100%",
  minWidth: 0,
  gridTemplateColumns: "5rem minmax(0, 1fr)",
  alignItems: "stretch",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  background: "var(--color-surface)",
  padding: "0.625rem",
  textAlign: "left",
  cursor: "pointer",

  "&:hover": {
    borderColor: "var(--color-primary)",
  },
  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "-2px",
  },
});

export const CarouselImage = styled("span", {
  position: "relative",
  minHeight: "6rem",
  borderRadius: "0.5rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",

});

export const CarouselInfo = styled("span", {
  display: "grid",
  minWidth: 0,
  alignContent: "center",
  gap: "0.375rem",
});

export const CarouselName = styled("span", {
  overflowWrap: "anywhere",
  fontSize: "1rem",
  fontWeight: 750,
  lineHeight: 1.2,
});

export const CarouselDescription = styled("span", {
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  fontSize: "0.8125rem",
  lineHeight: 1.35,
  color: "var(--color-muted)",
});

export const CarouselPrice = styled("span", {
  fontSize: "1rem",
  fontWeight: 800,
  color: "var(--color-primary-text)",
});
