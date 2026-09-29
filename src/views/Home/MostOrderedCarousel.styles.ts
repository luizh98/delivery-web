import { styled } from "styles";

export const CarouselSection = styled("section", {
  minWidth: 0,
  marginTop: "1rem",
  border: "1px solid color-mix(in srgb, var(--color-primary) 32%, var(--color-border))",
  borderRadius: "1rem",
  background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 13%, var(--color-surface)), var(--color-surface) 70%)",
  padding: "1rem",
  boxShadow: "0 8px 24px color-mix(in srgb, var(--color-primary) 9%, transparent)",

  "@sm": {
    padding: "1.25rem",
  },
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
    color: "var(--color-primary)",
  },
});

export const CarouselTitle = styled("h2", {
  fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
  fontWeight: 800,
  lineHeight: 1.2,
  color: "var(--color-foreground)",
});

export const CarouselControls = styled("div", {
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  gap: "0.25rem",
  marginLeft: "auto",
});

export const CarouselCount = styled("span", {
  minWidth: "3.25rem",
  textAlign: "center",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--color-muted)",
});

export const CarouselControl = styled("button", {
  display: "inline-flex",
  width: "2.25rem",
  height: "2.25rem",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  cursor: "pointer",

  "&:hover": {
    borderColor: "var(--color-primary)",
    color: "var(--color-primary)",
  },
  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },
});

export const CarouselTrack = styled("div", {
  display: "flex",
  minWidth: 0,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  overscrollBehaviorX: "contain",

  "&::-webkit-scrollbar": {
    display: "none",
  },
});

export const CarouselCard = styled("button", {
  display: "grid",
  flex: "0 0 100%",
  minWidth: 0,
  gridTemplateColumns: "6.5rem minmax(0, 1fr)",
  alignItems: "stretch",
  gap: "0.75rem",
  scrollSnapAlign: "start",
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
  "@sm": {
    gridTemplateColumns: "11rem minmax(0, 1fr)",
    gap: "1.25rem",
    padding: "0.875rem",
  },
});

export const CarouselImage = styled("span", {
  minHeight: "7rem",
  borderRadius: "0.5rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",

  "@sm": {
    minHeight: "9rem",
  },
});

export const CarouselInfo = styled("span", {
  display: "grid",
  minWidth: 0,
  alignContent: "center",
  gap: "0.375rem",
});

export const CarouselName = styled("span", {
  overflowWrap: "anywhere",
  fontSize: "clamp(1rem, 3vw, 1.25rem)",
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
  color: "var(--color-primary)",
});
