import { styled } from "styles";

export const OverlayCloseButton = styled("button", {
  position: "absolute",
  top: "1rem",
  left: "1rem",
  zIndex: 2,
  display: "grid",
  width: "2.75rem",
  height: "2.75rem",
  placeItems: "center",
  border: "1px solid rgb(255 255 255 / 0.35)",
  borderRadius: "9999px",
  background: "rgb(0 0 0 / 0.58)",
  color: "#ffffff",
  backdropFilter: "blur(6px)",

  "&:hover": {
    background: "rgb(0 0 0 / 0.75)",
  },
});

export const ZoomButton = styled("button", {
  position: "absolute",
  right: "1rem",
  top: "1rem",
  zIndex: 2,
  display: "grid",
  width: "2.75rem",
  height: "2.75rem",
  placeItems: "center",
  border: "1px solid rgb(255 255 255 / 0.35)",
  borderRadius: "9999px",
  background: "rgb(0 0 0 / 0.58)",
  color: "#ffffff",
  backdropFilter: "blur(6px)",

  "&:hover": {
    background: "rgb(0 0 0 / 0.75)",
  },
});

export const ProductLayout = styled("article", {
  display: "grid",
  width: "calc(100% + 2rem)",
  margin: "-1rem -1rem 0",
  overflow: "hidden",
  background: "var(--color-surface)",

  "@sm": {
    width: "100%",
    margin: 0,
    border: "1px solid var(--color-border)",
    borderRadius: "0.375rem",
  },

  "@md": {
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  },
});

export const ImageArea = styled("div", {
  position: "relative",
  minWidth: 0,
});

export const ProductBackButton = styled("div", {
  position: "absolute",
  top: "1rem",
  left: "1rem",
  zIndex: 2,

  button: {
    border: "1px solid rgb(255 255 255 / 0.35)",
    background: "rgb(0 0 0 / 0.58)",
    color: "#ffffff",
    backdropFilter: "blur(6px)",
  },

  "button:hover": {
    background: "rgb(0 0 0 / 0.75)",
  },
});

export const ProductImage = styled("div", {
  width: "100%",
  height: "100%",
  aspectRatio: "4 / 3",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",

  "@md": {
    minHeight: "100%",
    aspectRatio: "auto",
  },
});

export const ImageOverlay = styled("dialog", {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  width: "100%",
  maxWidth: "100%",
  height: "100dvh",
  maxHeight: "100dvh",
  margin: 0,
  padding: 0,
  border: 0,
  background: "#000",
  color: "#fff",
  "&::backdrop": { background: "#000" },
});

export const ImageOverlayContent = styled("div", {
  display: "grid",
  width: "100%",
  height: "calc(100% - 5rem - env(safe-area-inset-bottom))",
  gridTemplateRows: "minmax(0, 1fr) auto",
  maxWidth: "64rem",
  margin: "0 auto",
  paddingTop: "4.5rem",
  "@md": { gridTemplateColumns: "minmax(0, 3fr) minmax(16rem, 2fr)", gridTemplateRows: "minmax(0, 1fr)", gap: "2rem", padding: "4.5rem 2rem 1rem" },
});

export const ImageOverlayHeader = styled("div", {
  display: "grid",
  width: "100%",
  maxWidth: "64rem",
  gap: "0.25rem",
  padding: "0.75rem 1rem",
  maxHeight: "25dvh",
  overflowY: "auto",
  overflowWrap: "anywhere",
  "@md": { alignSelf: "center", maxHeight: "100%" },
});

export const ImageOverlayTitle = styled("h2", {
  color: "#ffffff",
  fontSize: "1.25rem",
  fontWeight: 700,
});

export const ImageOverlayDescription = styled("p", {
  color: "#d1d5db",
  fontSize: "0.875rem",
});

export const ProductContent = styled("div", {
  display: "grid",
  alignContent: "start",
  gap: "1rem",
  padding: "1rem",

  "@sm": {
    padding: "1.5rem",
  },
});

export const ProductHeader = styled("header", {
  display: "grid",
  gap: "0.375rem",
});

export const ProductTitle = styled("h1", {
  minWidth: 0,
  overflowWrap: "anywhere",
  fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
});

export const ProductDescription = styled("p", {
  fontSize: "1rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const ProductPrice = styled("p", {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const FlagBadges = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
});

export const FlagBadge = styled("span", {
  display: "inline-flex",
  height: "18px",
  alignItems: "center",
  borderRadius: "3px",
  border: "1px solid",
  padding: "0 0.375rem",
  fontSize: "10px",
  fontWeight: 600,
  lineHeight: 1,

  variants: {
    tone: {
      adult: {
        borderColor: "#171717",
        background: "#0a0a0a",
        color: "#ffffff",
      },
      gluten: {
        borderColor: "#fde68a",
        background: "#fffbeb",
        color: "#451a03",
      },
      lactose: {
        borderColor: "#bae6fd",
        background: "#f0f9ff",
        color: "#0369a1",
      },
      vegetarian: {
        borderColor: "#a7f3d0",
        background: "#ecfdf5",
        color: "#047857",
      },
    },
  },
});

export const OptionGroup = styled("section", {
  display: "grid",
  gap: "0.5rem",
});

export const OptionGroupTitle = styled("h2", {
  fontSize: "1.25rem",
  fontWeight: 600,
  lineHeight: 1.2,
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const OptionGroupError = styled("p", {
  marginTop: "0.25rem",
  fontSize: "0.75rem",
  color: "#dc2626",
});

export const OptionLabel = styled("label", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid",
  padding: "0.75rem",
  fontSize: "0.875rem",
  cursor: "pointer",

  span: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  variants: {
    selected: {
      true: {
        borderColor: "var(--color-primary)",
        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
      },
      false: {
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      },
    },
  },
});

export const OptionControl = styled("input", {
  width: "1rem",
  height: "1rem",
  flexShrink: 0,
  accentColor: "var(--color-primary)",
});

export const OptionPrice = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 600,
});

export const QuantityRow = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 20,
  padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
  background: "var(--color-surface)",
  borderTop: "1px solid var(--color-border)",
  "@md": { position: "sticky", left: "auto", right: "auto", marginTop: "0.5rem" },
});

export const MediaFrame = styled("div", {
  position: "relative",
  display: "grid",
  width: "100%",
  height: "65dvh",
  minHeight: "16rem",
  maxHeight: "48rem",
  background: "#000",
  variants: { expanded: { true: { minHeight: 0, maxHeight: "none", height: "100%" } } },
});

export const MediaVideo = styled("video", {
  display: "block",
  width: "100%",
  height: "100%",
  minHeight: 0,
  objectFit: "cover",
  objectPosition: "center",
});

export const MediaImage = styled("img", {
  display: "block",
  width: "100%",
  height: "100%",
  minHeight: 0,
  objectFit: "contain",
});

export const MediaNotice = styled("p", {
  position: "absolute",
  bottom: "1rem",
  left: "1rem",
  right: "1rem",
  padding: "0.5rem",
  background: "#000",
  color: "#fff",
  fontSize: "0.875rem",
});

export const MediaAction = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  width: "100%",
  maxWidth: "64rem",
  height: "calc(5rem + env(safe-area-inset-bottom))",
  margin: "0 auto",
  padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
  borderTop: "1px solid #333",
  background: "#000",
  fontWeight: 700,
});

export const QuantityControl = styled("div", {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
});

export const QuantityButton = styled("button", {
  padding: "0.75rem",
});

export const QuantityValue = styled("span", {
  width: "2.5rem",
  textAlign: "center",
  fontWeight: 600,
});
