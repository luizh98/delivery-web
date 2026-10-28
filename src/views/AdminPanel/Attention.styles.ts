import { styled } from "styles";

export const Root = styled("section", {
  borderTop: "1px solid var(--color-border)", marginTop: "0.5rem", paddingTop: "1.5rem",
});
export const Grid = styled("div", {
  display: "grid", gap: "1.75rem", marginTop: "1.25rem",
  "@lg": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "2rem" },
});
export const Group = styled("section", { minWidth: 0 });
export const Heading = styled("h3", {
  display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 700,
});
export const Count = styled("span", {
  fontSize: "0.75rem", fontWeight: 600, fontVariantNumeric: "tabular-nums",
  padding: "0.1rem 0.45rem", borderRadius: "0.25rem", background: "var(--color-background)",
});
export const List = styled("ul", { marginTop: "0.75rem" });
export const Row = styled("li", {
  display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.75rem",
  padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)",
  fontSize: "0.875rem", overflowWrap: "anywhere",
});
export const Detail = styled("p", { color: "var(--color-muted)", fontSize: "0.75rem", marginTop: "0.2rem" });
export const Duration = styled("span", { flexShrink: 0, fontSize: "0.75rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" });
export const Message = styled("p", { color: "var(--color-muted)", fontSize: "0.875rem", padding: "1rem 0" });
export const Action = styled("a", {
  display: "inline-flex", alignItems: "center", gap: "0.4rem", minHeight: "2.75rem",
  marginTop: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, textUnderlineOffset: "0.2em",
  "&:hover": { textDecoration: "underline" },
  "&:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
});
