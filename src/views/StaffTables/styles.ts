import { styled } from "styles";

export const Root = styled("section", {
  maxWidth: "90rem", margin: "0 auto", paddingBottom: "6rem", display: "grid", gap: "1.5rem",
  "@lg": { paddingBottom: "3rem" },
  "& :is(button, a, input, textarea, select):focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "3px" },
  "& input, & textarea": { caretColor: "var(--color-primary-text)" },
  "& ::selection": { background: "var(--color-primary)", color: "var(--color-primary-foreground)" },
  "& [data-state='free']": { "--table-color": "#15803d" },
  "& [data-state='occupied']": { "--table-color": "#b91c1c" },
  "& [data-state='closing']": { "--table-color": "#854d0e" },
  "& .table-legend": { display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem", color: "var(--color-muted)" },
  "& .table-legend span": { display: "inline-flex", alignItems: "center", gap: "0.375rem" },
  "& .table-legend span::before": { content: "''", width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "var(--table-color)" },
  "& .table-legend [data-state='closing']::before": { background: "#eab308" },
  "& .table-guests-form": { display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", "& > button": { marginTop: "1.625rem", minHeight: "2.75rem" } },
});
export const Header = styled("header", { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border)" });
export const Title = styled("h1", { fontSize: "1.5rem", lineHeight: 1.25, fontWeight: 700 });
export const Heading = styled("h2", { fontSize: "1.125rem", fontWeight: 700 });
export const Muted = styled("p", { color: "var(--color-muted)", fontSize: "0.875rem", lineHeight: 1.5 });
export const Row = styled("div", { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" });
export const Actions = styled("div", { display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" });
export const Stack = styled("div", { display: "grid", gap: "1rem", minWidth: 0 });
export const ErrorBox = styled("p", { padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "0.75rem", background: "var(--color-surface)", fontSize: "0.875rem", fontWeight: 600 });
export const TableGrid = styled("div", { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(7.5rem, 1fr))", gap: "0.75rem", "@lg": { gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))" } });
export const TableButton = styled("button", {
  display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "0.375rem", minWidth: 0, textAlign: "left", padding: "1rem", minHeight: "6rem", color: "var(--table-color)", background: "color-mix(in srgb, var(--table-color) 6%, var(--color-surface))", border: "1px solid color-mix(in srgb, var(--table-color) 35%, var(--color-border))", borderRadius: "0.75rem", overflowWrap: "anywhere",
  "&:hover": { background: "color-mix(in srgb, var(--table-color) 12%, var(--color-surface))", borderColor: "var(--table-color)" },
  "&[data-state='closing']": { background: "#fef3c7", borderColor: "#eab308", "&:hover": { background: "#fde68a", borderColor: "#ca8a04" } },
  "& strong": { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3 },
  "& .table-status": { display: "none", fontSize: "0.8125rem", fontWeight: 600 },
  "& .table-details": { display: "none", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums" },
  "& .table-request": { display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600 },
  "& svg": { flexShrink: 0 },
  "@lg": { minHeight: "9rem", "& .table-status": { display: "block" }, "& .table-details": { display: "flex" } },
});
export const Badge = styled("span", { display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 600, width: "fit-content", color: "var(--color-primary-text)" });
export const Workbench = styled("div", { display: "grid", alignItems: "start", gap: "1.5rem", "@(max-width: 1023px)": { "&[data-mobile-pane='ticket'] > section:first-of-type": { display: "none" }, "&[data-mobile-pane='catalog'] > section:last-of-type": { display: "none" } }, "@lg": { gridTemplateColumns: "minmax(0, 1.3fr) minmax(20rem, 0.8fr)" } });
export const MobileSwitch = styled("div", { display: "flex", gap: "0.5rem", flexWrap: "wrap", "@lg": { display: "none" } });
export const MobileBar = styled("div", { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10, display: "grid", gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)", gap: "0.5rem", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", padding: "0.75rem 1rem max(0.75rem, env(safe-area-inset-bottom))", "& button": { width: "100%", height: "auto", minHeight: "3rem", padding: "0.5rem", fontSize: "0.8125rem" }, "@lg": { display: "none" } });
export const AccountPanel = styled("section", { display: "grid", gap: "1rem", minWidth: 0, padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "0.75rem", background: "color-mix(in srgb, var(--color-primary) 7%, var(--color-surface))", "& h2": { display: "flex", alignItems: "center", gap: "0.5rem" }, "& > div[role='status']": { display: "grid", gap: "0.5rem" }, "& > div:last-child button": { minHeight: "2.75rem" } });
export const AccountTotal = styled("div", { display: "grid", gap: "0.25rem", "& > span": { fontSize: "0.75rem", color: "var(--color-muted)" }, "& > strong": { fontSize: "1.375rem" } });
export const Panel = styled("section", { minWidth: 0, display: "grid", gap: "1rem", padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "0.75rem", background: "var(--color-surface)" });
export const Tabs = styled("div", { display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem" });
export const ProductList = styled("div", { display: "grid", gap: 0 });
export const ProductButton = styled("button", { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", minHeight: "4.5rem", textAlign: "left", padding: "1rem 0", borderBottom: "1px solid var(--color-border)", "&:hover": { color: "var(--color-primary-text)" }, "& strong": { fontWeight: 600 }, "& span": { minWidth: 0 }, "& svg": { flexShrink: 0 }, "&[aria-disabled='true']": { color: "var(--color-muted)", cursor: "not-allowed" } });
export const ItemRow = styled("div", { display: "grid", gap: "0.5rem", padding: "1rem 0", borderBottom: "1px solid var(--color-border)", overflowWrap: "anywhere" });
export const Price = styled("strong", { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontWeight: 700 });
export const Summary = styled("div", { display: "grid", gap: "0.75rem", paddingTop: "0.5rem", background: "var(--color-surface)", "& > button": { minHeight: "3rem", width: "100%" }, "& > button[aria-disabled='true']": { background: "var(--color-surface-muted)", color: "var(--color-muted)", borderColor: "var(--color-border)", boxShadow: "none", cursor: "not-allowed" } });
export const Empty = styled("div", { padding: "2rem 0", display: "grid", gap: "0.5rem", color: "var(--color-muted)", lineHeight: 1.6 });
export const Dialog = styled("dialog", {
  margin: "auto", width: "min(36rem, calc(100% - 1.5rem))", maxHeight: "calc(100dvh - 2rem)", overflowY: "auto", overscrollBehavior: "contain", padding: "1.5rem", border: "none", borderRadius: "1rem", background: "var(--color-surface)", color: "var(--color-foreground)",
  "&::backdrop": { background: "rgb(0 0 0 / 45%)" },
  "& form": { display: "grid", gap: "1rem" },
  "& button:focus-visible, & input:focus-visible, & textarea:focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "2px" },
});
export const GuestCountControls = styled("div", {
  display: "grid", gridTemplateColumns: "3rem minmax(0, 1fr) 3rem", gap: "0.5rem", width: "100%", maxWidth: "20rem", minWidth: 0,
  "& > button": { width: "3rem", height: "3rem", padding: 0, "&:disabled": { background: "var(--color-surface-muted)", color: "var(--color-muted)", cursor: "not-allowed" } },
  "& input": { width: "100%", minWidth: 0, height: "3rem", fontSize: "1.125rem", fontVariantNumeric: "tabular-nums", textAlign: "center", appearance: "textfield" },
  "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button": { WebkitAppearance: "none", margin: 0 },
  "& button:focus-visible, & input:focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "2px" },
});
export const OptionSet = styled("fieldset", { display: "grid", gap: "0.5rem", "& legend": { fontWeight: 600, marginBottom: "0.5rem" } });
export const Option = styled("label", { display: "flex", gap: "0.75rem", alignItems: "center", minHeight: "2.75rem", "& input": { width: "1.125rem", height: "1.125rem", accentColor: "var(--color-primary-text)" } });
