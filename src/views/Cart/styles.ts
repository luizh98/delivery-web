import { styled } from "styles";

export const CartPageHeader = styled("header", {
  display: "grid",
  gap: "0.5rem",
  marginBottom: "1rem",
});

export const CartPageTitleRow = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const CartPageTitle = styled("h1", {
  minWidth: 0,
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

export const CartStepAction = styled("div", {
  marginTop: "1rem",

  button: {
    width: "100%",
  },
});

export const StepIndicator = styled("ol", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  marginBottom: "1rem",
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
});

export const StepItem = styled("li", {
  display: "flex",
  minHeight: "3rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 600,

  variants: {
    active: {
      true: {
        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
        color: "var(--color-primary)",
      },
      false: {
        color: "var(--color-muted)",
      },
    },
  },
});

export const StepNumber = styled("span", {
  display: "grid",
  width: "1.5rem",
  height: "1.5rem",
  placeItems: "center",
  borderRadius: "9999px",
  border: "1px solid currentColor",
  fontSize: "0.75rem",

  variants: {
    active: {
      true: {
        background: "var(--color-primary)",
        color: "var(--color-surface)",
      },
      false: {},
    },
  },
});

export const CheckoutSection = styled("fieldset", {
  display: "grid",
  gap: "0.75rem",
  minWidth: 0,
  border: 0,
  padding: 0,
});

export const CheckoutSectionTitle = styled("legend", {
  marginBottom: "0.75rem",
  fontSize: "1rem",
  fontWeight: 700,
});

export const PaymentGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.5rem",
});

export const CheckoutConfirmation = styled("label", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",

  input: {
    width: "1.125rem",
    height: "1.125rem",
    flexShrink: 0,
    marginTop: "0.125rem",
    accentColor: "var(--color-primary)",
  },
});

export const CheckoutConfirmationText = styled("span", {
  fontSize: "0.875rem",
  lineHeight: 1.5,
});

export const AddressSearchControl = styled("div", {
  position: "relative",

  input: {
    width: "100%",
    paddingLeft: "2.5rem",
  },
});

export const AddressSearchIcon = styled("span", {
  position: "absolute",
  top: "50%",
  left: "0.75rem",
  zIndex: 1,
  display: "grid",
  transform: "translateY(-50%)",
  placeItems: "center",
  color: "var(--color-muted)",
  pointerEvents: "none",
});

export const AddressSuggestions = styled("div", {
  display: "grid",
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "0 10px 25px -10px rgb(0 0 0 / 0.25)",
});

export const AddressSuggestion = styled("button", {
  display: "flex",
  width: "100%",
  alignItems: "flex-start",
  gap: "0.5rem",
  borderBottom: "1px solid var(--color-border)",
  padding: "0.75rem",
  textAlign: "left",
  fontSize: "0.875rem",
  fontWeight: 400,

  svg: {
    flexShrink: 0,
    marginTop: "0.125rem",
    color: "var(--color-primary)",
  },

  "&:hover": {
    background: "var(--color-surface-muted)",
  },
});

export const GoogleMapsAttribution = styled("span", {
  justifySelf: "end",
  padding: "0.375rem 0.75rem",
  color: "#5e5e5e",
  fontFamily: "Roboto, sans-serif",
  fontSize: "0.75rem",
  fontStyle: "normal",
  fontWeight: 400,
  letterSpacing: "normal",
  whiteSpace: "nowrap",
});

export const AddressSearchStatus = styled("span", {
  fontSize: "0.75rem",
  fontWeight: 400,
  color: "var(--color-muted)",
});
