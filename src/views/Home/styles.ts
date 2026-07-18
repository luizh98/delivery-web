import { styled } from "styles";

export const Hero = styled("header", {
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
});

export const HeroBanner = styled("div", {
  height: "8rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const HeroBody = styled("div", {
  display: "grid",
  gap: "0.5rem",
  padding: "1rem",
});

export const Eyebrow = styled("p", {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "var(--color-muted)",
});

export const HeroTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const HeroText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const CategoryBar = styled("div", {
  position: "sticky",
  top: 0,
  zIndex: 10,
  overflowX: "auto",
  margin: "1rem -1rem 0",
  borderTop: "1px solid var(--color-border)",
  borderBottom: "1px solid var(--color-border)",
  background: "color-mix(in srgb, var(--color-background) 95%, transparent)",
  padding: "0.75rem 1rem",
  backdropFilter: "blur(8px)",

  "@sm": {
    marginLeft: 0,
    marginRight: 0,
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

  "@lg": {
    gridTemplateColumns: "1fr 360px",
  },
});

export const ProductList = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const CategorySection = styled("section", {
  scrollMarginTop: "6rem",
  outline: "none",
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
  borderTop: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.75rem",
  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  "@lg": {
    display: "none",
  },
});

export const MobileSummary = styled("summary", {
  display: "flex",
  listStyle: "none",
  alignItems: "center",
  justifyContent: "space-between",
});

export const MobileSummaryLabel = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 600,
});

export const MobileTotal = styled("span", {
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const MobileCartBody = styled("div", {
  maxHeight: "70vh",
  overflowY: "auto",
  marginTop: "0.75rem",
});

export const ModalOverlay = styled("div", {
  position: "fixed",
  inset: 0,
  zIndex: 30,
  display: "grid",
  placeItems: "end",
  background: "rgb(0 0 0 / 0.4)",

  "@sm": {
    placeItems: "center",
    padding: "1rem",
  },
});

export const Modal = styled("div", {
  width: "100%",
  maxHeight: "92vh",
  overflowY: "auto",
  borderRadius: "0.375rem 0.375rem 0 0",
  background: "var(--color-surface)",
  padding: "1rem",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",

  "@sm": {
    maxWidth: "36rem",
    borderRadius: "0.375rem",
  },
});

export const ModalProductImage = styled("div", {
  width: "100%",
  aspectRatio: "4 / 3",
  marginBottom: "1rem",
  borderRadius: "0.375rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundSize: "cover",

  "@sm": {
    aspectRatio: "16 / 9",
  },
});

export const ModalHeader = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const ModalTitle = styled("h2", {
  fontSize: "1.25rem",
  fontWeight: 700,
});

export const ModalText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const CloseButton = styled("button", {
  borderRadius: "0.375rem",
  padding: "0.5rem",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },
});

export const ModalContent = styled("div", {
  display: "grid",
  gap: "1rem",
  marginTop: "1rem",
});

export const OptionGroup = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const OptionGroupTitle = styled("h3", {
  fontWeight: 600,
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const OptionButton = styled("button", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "0.375rem",
  border: "1px solid",
  padding: "0.75rem",
  fontSize: "0.875rem",

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

export const OptionPrice = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 600,
});

export const QuantityRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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

export const CartItemHeader = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const CartItemName = styled("p", {
  fontWeight: 600,
});

export const RemoveButton = styled("button", {
  borderRadius: "0.375rem",
  padding: "0.5rem",
  color: "#dc2626",

  "&:hover": {
    background: "#fef2f2",
  },
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
