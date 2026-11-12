import { styled } from "styles";

export const CheckoutRoot = styled("section", {
  maxWidth: "74rem", margin: "0 auto", display: "grid", gap: "1.5rem", paddingBottom: "2rem", minWidth: 0,
  "& :is(button, input, select, summary):focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "3px" },
  "& input": { caretColor: "var(--color-primary-text)" },
  "& ::selection": { background: "var(--color-primary)", color: "var(--color-primary-foreground)" },
  "& h2": { fontSize: "1.125rem", fontWeight: 700 },
  "& .checkout-admin-actions": { borderTop: "1px solid var(--color-border)", paddingTop: "1rem", fontSize: "0.875rem", "& summary": { cursor: "pointer", color: "var(--color-muted)", padding: "0.5rem 0" }, "& button": { marginTop: "0.75rem" } },
});
export const CheckoutTotals = styled("dl", {
  display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem", padding: "1.25rem 0", borderBottom: "1px solid var(--color-border)",
  "& dt": { fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.375rem" },
  "& dd": { fontSize: "1.125rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" },
  "& > div:last-child dd": { fontWeight: 800 },
  "@md": { "& dt": { fontSize: "0.875rem" }, "& dd": { fontSize: "1.75rem" } },
});
export const PaymentWorkspace = styled("div", {
  display: "grid", gap: "1.5rem", minWidth: 0,
  "& form": { display: "grid", gap: "1.5rem", alignItems: "start", minWidth: 0, "@lg": { gridTemplateColumns: "minmax(0, 1.4fr) minmax(18rem, 0.8fr)", gap: "2.5rem" } },
  "& input, & select": { maxWidth: "100%", minWidth: 0 },
});
export const PaymentSelection = styled("section", { display: "grid", gap: "1rem", minWidth: 0 });
export const PaymentDetails = styled("section", {
  display: "grid", gap: "1rem", minWidth: 0, paddingTop: "1.25rem", borderTop: "1px solid var(--color-border)",
  "@lg": { position: "sticky", top: "5rem", paddingTop: 0, borderTop: "none" },
});
export const PaymentLine = styled("div", {
  display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "0.75rem", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid var(--color-border)",
  "& [data-item-info]": { display: "grid", gap: "0.25rem", minWidth: 0, overflowWrap: "anywhere", "& strong": { fontWeight: 600 }, "& p": { fontSize: "0.8125rem" } },
  "&[data-selected='true'] [data-item-info] > strong": { fontWeight: 700 },
});
export const PaymentQuantity = styled("div", {
  display: "grid", gridTemplateColumns: "2.75rem 2.75rem 2.75rem", gap: "0.25rem", alignItems: "center",
  "& button": { width: "2.75rem", height: "2.75rem", padding: 0, boxShadow: "none" },
  "& input": { width: "2.75rem", height: "2.75rem", textAlign: "center", padding: 0, fontVariantNumeric: "tabular-nums", appearance: "textfield" },
  "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 },
  "@(max-width: 359px)": { gridTemplateColumns: "2.75rem 2.25rem 2.75rem", "& input": { width: "2.25rem" } },
});
export const PaymentAmount = styled("div", {
  display: "grid", gap: "0.5rem", padding: "1rem 0", borderTop: "1px solid var(--color-border)",
  "& > div:last-child": { paddingTop: "0.5rem", fontWeight: 700, "& strong": { fontSize: "1.5rem" } },
});
export const PaymentHistory = styled("section", {
  borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", display: "grid", gap: "0.75rem", minWidth: 0,
  "& details": { fontSize: "0.8125rem", "& summary": { color: "var(--color-muted)", cursor: "pointer", padding: "0.375rem 0" } },
});
export const CheckoutNotice = styled("div", {
  display: "grid", gap: "0.75rem", justifyItems: "start", padding: "1.25rem 0", maxWidth: "42rem",
  "& h2": { display: "flex", alignItems: "center", gap: "0.5rem" },
});
