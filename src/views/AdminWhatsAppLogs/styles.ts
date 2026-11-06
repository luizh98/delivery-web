import { styled } from "styles";

export const Root = styled("div", {
  display: "grid", gap: "1rem", minWidth: 0,
  "& :focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
});
export const Header = styled("header", { display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" });
export const Title = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const Muted = styled("p", { fontSize: "0.875rem", lineHeight: 1.5, color: "var(--color-muted)", overflowWrap: "anywhere" });
export const Actions = styled("div", { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" });
export const FiltersForm = styled("form", {
  display: "grid", gap: "0.75rem", alignItems: "end",
  "@sm": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  "@lg": { gridTemplateColumns: "minmax(180px, 1fr) minmax(180px, 1fr) minmax(160px, 1fr) auto" },
});
export const List = styled("div", { minWidth: 0, borderTop: "1px solid var(--color-border)" });
export const Row = styled("article", { minWidth: 0, borderBottom: "1px solid var(--color-border)", padding: "1rem 0" });
export const OrderButton = styled("button", {
  width: "100%", textAlign: "left", display: "grid", gap: "0.5rem", padding: "0.25rem 0", minWidth: 0,
  "&:hover strong": { textDecoration: "underline", textUnderlineOffset: "3px" },
});
export const RowHeading = styled("span", { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.95rem", overflowWrap: "anywhere" });
export const Tag = styled("span", { fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 500 });
export const Detail = styled("section", { minWidth: 0, display: "grid", gap: "1rem", padding: "1rem 0 0.25rem" });
export const SectionTitle = styled("h2", { fontSize: "1.125rem", fontWeight: 700 });
export const SubTitle = styled("h3", { fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.35rem" });
export const Timeline = styled("ol", {
  display: "grid", gap: "0.65rem", listStyle: "none", padding: "0.75rem 0", minWidth: 0,
  li: { fontSize: "0.875rem", lineHeight: 1.6, overflowWrap: "anywhere" },
  time: { fontVariantNumeric: "tabular-nums" },
});
export const Notice = styled("p", { fontSize: "0.875rem", lineHeight: 1.6, padding: "0.5rem 0", overflowWrap: "anywhere" });
export const Pagination = styled("nav", { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.875rem" });
export const ConnectionInfo = styled("details", {
  fontSize: "0.875rem", lineHeight: 1.6, summary: { cursor: "pointer" },
});
