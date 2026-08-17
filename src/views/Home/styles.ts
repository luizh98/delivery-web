import { styled } from "styles";

export const Hero = styled("header", {
  width: "100%",
  background: "var(--color-surface)",
});

export const HeroBanner = styled("div", {
  height: "clamp(10rem, 28vw, 18rem)",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const HeroBody = styled("div", {
  display: "grid",
  width: "100%",
  maxWidth: "72rem",
  gap: "0.5rem",
  margin: "0 auto",
  padding: "1rem",

  "@sm": {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
  },
});

export const ClosedStoreNotice = styled("p", {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  gap: "0.375rem",
  border: "1px solid #dc2626",
  borderRadius: "9999px",
  padding: "0.375rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#dc2626",

  svg: {
    flexShrink: 0,
  },
});

export const HeroTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const HeroTitleRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
});

export const HeroText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const HeroDetailsRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  marginTop: "0.25rem",
});

export const HeroInfoGrid = styled("div", {
  display: "flex",
  minWidth: 0,
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem 1rem",
});

export const HeroInfoItem = styled("p", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",

  svg: {
    flexShrink: 0,
  },

  strong: {
    color: "var(--color-foreground)",
    fontWeight: 600,
  },
});

export const TrackingActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

export const TrackingShortcut = styled("button", {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  border: "1px solid var(--color-primary)",
  borderRadius: "0.625rem",
  padding: "0.625rem 0.875rem",
  fontSize: "0.875rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
  cursor: "pointer",

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },

  svg: {
    flexShrink: 0,
  },

  variants: {
    tone: {
      primary: {
        background: "var(--color-primary)",
        color: "#ffffff",
      },
      secondary: {
        background: "var(--color-surface)",
        color: "var(--color-primary)",
      },
    },
  },
});

export const WhatsAppShortcut = styled("a", {
  display: "inline-flex",
  width: "2rem",
  height: "2rem",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  color: "#25d366",
  textDecoration: "none",

  "&:hover": {
    background: "color-mix(in srgb, #25d366 12%, transparent)",
  },

  "&:focus-visible": {
    outline: "2px solid #25d366",
    outlineOffset: "2px",
  },

  svg: {
    width: "1.375rem",
    height: "1.375rem",
    flexShrink: 0,
  },
});

export const CategoryBar = styled("div", {
  position: "sticky",
  top: 0,
  zIndex: 10,
  overflowX: "auto",
  margin: "0 -1rem 0 0",
  borderTop: "1px solid var(--color-border)",
  borderBottom: "1px solid var(--color-border)",
  background: "color-mix(in srgb, var(--color-background) 95%, transparent)",
  padding: "0.75rem 1rem",
  backdropFilter: "blur(8px)",

  "@sm": {
    margin: "0 0 0 0",
    border: "1px solid var(--color-border)",
    borderRadius: "0.375rem",
  },
});

export const CategoryList = styled("div", {
  display: "flex",
  minWidth: "max-content",
  gap: "0.5rem",
});

export const CategoryButton = styled("button", {
  borderRadius: "0.375rem",
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,

  variants: {
    active: {
      true: {
        background: "var(--color-primary)",
        color: "#ffffff",
      },
      false: {
        background: "var(--color-surface)",
        color: "var(--color-foreground)",
      },
    },
  },
});

export const ContentGrid = styled("section", {
  display: "grid",
  gap: "0.75rem",
  marginTop: "1rem",
});

export const ProductList = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const CategorySection = styled("section", {
  scrollMarginTop: "6rem",
  outline: "none",

  "&:not(:first-of-type)": {
    marginTop: "1rem",
    borderTop: "1px solid var(--color-border)",
    paddingTop: "1rem",
  },
});

export const CategoryTitle = styled("h2", {
  marginBottom: "0.5rem",
  fontSize: "1.125rem",
  fontWeight: 700,
});

export const CategoryProducts = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-surface)",
  padding: "1.5rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ProductCard = styled("button", {
  display: "grid",
  gridTemplateColumns: "1fr 96px",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.75rem",
  textAlign: "left",
  transition: "border-color 150ms ease",

  "&:hover": {
    borderColor: "var(--color-primary)",
  },
});

export const ProductInfo = styled("span", {
  display: "grid",
  alignContent: "start",
  gap: "0.25rem",
});

export const ProductName = styled("span", {
  fontWeight: 600,
});

export const ProductDescription = styled("span", {
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ProductPrice = styled("span", {
  paddingTop: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const FlagBadges = styled("span", {
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

export const ProductImage = styled("span", {
  height: "6rem",
  borderRadius: "0.375rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const DesktopCart = styled("aside", {
  display: "none",

  "@lg": {
    display: "block",
  },
});

export const MobileCart = styled("div", {
  position: "fixed",
  insetInline: 0,
  bottom: 0,
  zIndex: 20,
  borderTop: "1px solid var(--color-primary)",
  background: "var(--color-primary)",
  padding: "0.75rem",
  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  "@lg": {
    insetInline: "auto 1.5rem",
    bottom: "1.5rem",
    width: "22rem",
    border: "1px solid var(--color-border)",
    borderRadius: "0.375rem",
  },
});

export const MobileSummary = styled("button", {
  display: "flex",
  width: "100%",
  minHeight: "3rem",
  alignItems: "center",
  justifyContent: "space-between",
  background: "transparent",
  padding: "0.25rem",
  color: "#ffffff",
  textAlign: "left",
  transition: "transform 180ms ease, opacity 180ms ease",

  "&:hover": {
    opacity: 0.9,
  },

  variants: {
    feedback: {
      true: {
        justifyContent: "center",
        transform: "scale(1.02)",
      },
      false: {},
    },
  },

  "@motion-reduce": {
    transition: "none",
  },
});

export const MobileSummaryLabel = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 600,
});

export const MobileTotal = styled("span", {
  fontWeight: 700,
  color: "#ffffff",
});

export const MobileCartBody = styled("div", {
  minHeight: 0,
  flex: 1,
  overflowY: "auto",
  padding: "1rem",

  "> div": {
    border: 0,
    padding: 0,
  },
});

export const MobileCartModal = styled("div", {
  position: "fixed",
  inset: 0,
  zIndex: 40,
  display: "flex",
  flexDirection: "column",
  background: "var(--color-surface)",

  "@lg": {
    display: "none",
  },
});

export const MobileCartHeader = styled("div", {
  display: "flex",
  minHeight: "4rem",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid var(--color-border)",
  padding: "0.75rem 1rem",
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const CartCard = styled("div", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const CartHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const CartTitle = styled("h2", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.125rem",
  fontWeight: 700,
});

export const CartCount = styled("span", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ContinueShoppingButton = styled("button", {
  display: "inline-flex",
  width: "100%",
  minHeight: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  margin: "1rem 0",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-primary)",
  color: "var(--color-primary)",
  fontSize: "0.875rem",
  fontWeight: 600,

  "&:hover": {
    background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
  },
});

export const CartList = styled("div", {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.75rem",
});

export const EmptyCart = styled("p", {
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const CartItem = styled("div", {
  display: "grid",
  gap: "0.25rem",
  borderBottom: "1px solid var(--color-border)",
  paddingBottom: "0.75rem",
});

export const CartItemContent = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const CartItemImage = styled("span", {
  width: "4rem",
  height: "4rem",
  flexShrink: 0,
  borderRadius: "0.375rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const CartItemHeader = styled("div", {
  display: "flex",
  minWidth: 0,
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const CartItemName = styled("p", {
  fontWeight: 600,
});

export const CartItemControls = styled("div", {
  display: "inline-flex",
  flexShrink: 0,
  alignItems: "center",
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
});

export const CartItemControlButton = styled("button", {
  display: "grid",
  width: "2rem",
  height: "2rem",
  placeItems: "center",
  color: "var(--color-foreground)",

  variants: {
    destructive: {
      true: {
        color: "#dc2626",
      },
      false: {},
    },
  },

  "&:hover": {
    background: "var(--color-surface-muted)",
  },
});

export const CartItemQuantity = styled("span", {
  minWidth: "2rem",
  textAlign: "center",
  fontSize: "0.875rem",
  fontWeight: 700,
});

export const CartRemovalOverlay = styled("div", {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "grid",
  alignItems: "end",
  background: "rgb(0 0 0 / 0.4)",
});

export const CartRemovalDialog = styled("div", {
  display: "grid",
  width: "100%",
  maxWidth: "32rem",
  justifySelf: "center",
  gap: "1rem",
  borderRadius: "0.75rem 0.75rem 0 0",
  background: "var(--color-surface)",
  padding: "1.25rem",
  paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
  boxShadow: "0 -10px 25px -5px rgb(0 0 0 / 0.15)",

  "@sm": {
    marginBottom: "1rem",
    borderRadius: "0.75rem",
  },
});

export const CartRemovalMessage = styled("p", {
  fontSize: "1.125rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",

  strong: {
    color: "var(--color-foreground)",
  },
});

export const CartRemovalActions = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const CartItemTotal = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const CheckoutForm = styled("form", {
  display: "grid",
  gap: "0.75rem",
  marginTop: "1rem",
});

export const DeliveryToggleGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.5rem",
});

export const DeliveryButton = styled("button", {
  display: "inline-flex",
  height: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid",
  fontSize: "0.875rem",
  fontWeight: 600,

  variants: {
    selected: {
      true: {
        borderColor: "var(--color-primary)",
        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
      },
      false: {
        borderColor: "var(--color-border)",
      },
    },
  },
});

export const DeliveryFields = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const AddressGrid = styled("div", {
  display: "grid",
  gap: "0.5rem",

  label: {
    minWidth: 0,
  },

  input: {
    width: "100%",
    minWidth: 0,
  },

  "@sm": {
    gridTemplateColumns: "minmax(5.5rem, 7.5rem) minmax(0, 1fr)",
  },
});

export const TotalsBox = styled("div", {
  display: "grid",
  gap: "0.25rem",
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  fontSize: "0.875rem",
});

export const TotalRow = styled("span", {
  display: "flex",
  justifyContent: "space-between",
});

export const TotalGrand = styled("span", {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "1rem",
});

export const TotalStrong = styled("strong", {
  color: "var(--color-primary)",
});

export const CheckoutError = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const SuccessBox = styled("div", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-primary)",
  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  padding: "0.75rem",
  fontSize: "0.875rem",
});
