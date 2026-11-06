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
export const List = styled("div", { minWidth: 0, display: "grid", gap: "1rem" });
export const Row = styled("article", {
  minWidth: 0, border: "1px solid var(--color-border)", borderRadius: "0.75rem", background: "var(--color-surface)",
  "&[data-expanded=true] > button": { background: "var(--color-surface-muted)", borderRadius: "0.75rem 0.75rem 0 0" },
});
export const OrderButton = styled("button", {
  width: "100%", textAlign: "left", display: "grid", gap: "0.375rem", padding: "1rem", minWidth: 0, borderRadius: "0.75rem",
  "@sm": { padding: "1.25rem" },
  "&:hover strong": { textDecoration: "underline", textUnderlineOffset: "3px" },
});
export const RowHeading = styled("span", { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.95rem", overflowWrap: "anywhere" });
export const Tag = styled("span", { fontSize: "0.8rem", color: "var(--color-muted)", fontWeight: 500 });
export const Detail = styled("section", {
  minWidth: 0, display: "grid", borderTop: "1px solid var(--color-border)",
  "& > [role=status], & > [role=alert]": { padding: "1rem" },
});
export const DetailHeading = styled("header", {
  display: "grid", gap: "0.25rem", padding: "1rem", "@sm": { padding: "1.25rem" },
});
export const StageSection = styled("section", {
  minWidth: 0, padding: "1.25rem 1rem", borderTop: "1px solid var(--color-border)",
  "@sm": { padding: "1.5rem 1.25rem" },
});
export const StageHeader = styled("div", {
  display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem 1rem", marginBottom: "0.5rem",
});
export const Result = styled("span", {
  display: "inline-block", fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.5, padding: "0.25rem 0.5rem",
  border: "1px solid var(--color-border)", borderRadius: "0.375rem", overflowWrap: "anywhere",
});
export const SectionTitle = styled("h2", { fontSize: "1.125rem", fontWeight: 700 });
export const SubTitle = styled("h3", { fontSize: "1rem", fontWeight: 700, lineHeight: 1.4 });
export const LogTable = styled("table", {
  width: "100%", tableLayout: "fixed", borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.8125rem", lineHeight: 1.6,
  caption: { textAlign: "left", fontSize: "0.875rem", fontWeight: 600, paddingBottom: "0.5rem" },
  th: { textAlign: "left", fontWeight: 500, color: "var(--color-muted)", background: "var(--color-surface-muted)" },
  "th, td": { padding: "0.625rem 0.5rem", verticalAlign: "top", overflowWrap: "anywhere", borderBottom: "1px solid var(--color-border)" },
  "th:first-child": { width: "46%" },
  "td > strong": { display: "block", fontWeight: 600 },
  "td p": { fontSize: "inherit", lineHeight: "inherit" },
  time: { display: "block", fontVariantNumeric: "tabular-nums" },
  small: { display: "block", color: "var(--color-muted)", fontSize: "0.75rem" },
});
export const TechnicalDetails = styled("details", {
  marginTop: "0.75rem", minWidth: 0, fontSize: "0.8125rem", lineHeight: 1.6,
  summary: { cursor: "pointer", padding: "0.25rem 0" },
  dl: { display: "grid", gap: "0.25rem", marginTop: "0.5rem" },
  dt: { fontWeight: 600 },
  dd: { color: "var(--color-muted)", overflowWrap: "anywhere" },
});
export const Notice = styled("p", { fontSize: "0.875rem", lineHeight: 1.6, padding: "0.5rem 0", overflowWrap: "anywhere" });
export const Pagination = styled("nav", { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.875rem" });
export const ConnectionInfo = styled("details", {
  fontSize: "0.875rem", lineHeight: 1.6, summary: { cursor: "pointer" },
});
