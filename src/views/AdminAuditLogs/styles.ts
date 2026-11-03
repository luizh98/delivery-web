import { styled } from "styles";

export const Root = styled("div", {
  display: "grid", gap: "1rem", minWidth: 0,
  "& :focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
});
export const Header = styled("header", {
  display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between",
});
export const Title = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const Muted = styled("p", { fontSize: "0.875rem", lineHeight: 1.5, color: "var(--color-muted)", overflowWrap: "anywhere" });
export const Filters = styled("form", {
  display: "grid", gap: "0.75rem", padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "0.5rem", background: "var(--color-surface)",
  "@sm": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  "@lg": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
});
export const Actions = styled("div", { display: "flex", alignItems: "end", flexWrap: "wrap", gap: "0.5rem" });
export const List = styled("div", { minWidth: 0, borderTop: "1px solid var(--color-border)" });
export const Entry = styled("article", {
  minWidth: 0, padding: "1rem 0", borderBottom: "1px solid var(--color-border)",
  summary: { cursor: "pointer", lineHeight: 1.6, overflowWrap: "anywhere", "&:hover": { color: "var(--color-primary-text)" } },
});
export const Summary = styled("div", { display: "grid", gap: "0.35rem", marginBottom: "0.5rem", minWidth: 0 });
export const SummaryHeading = styled("div", { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.5rem", overflowWrap: "anywhere" });
export const Status = styled("span", { fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted)" });
export const Time = styled("time", { fontSize: "0.8rem", color: "var(--color-muted)", fontVariantNumeric: "tabular-nums" });
export const ChangeList = styled("dl", {
  display: "grid", gap: "0.75rem", marginTop: "0.75rem", minWidth: 0,
  dt: { fontSize: "0.875rem", fontWeight: 600, overflowWrap: "anywhere" },
});
export const Values = styled("dd", {
  display: "grid", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.875rem", minWidth: 0,
  "@sm": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  pre: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit" },
  small: { display: "block", marginBottom: "0.2rem", color: "var(--color-muted)" },
});
export const Value = styled("div", { minWidth: 0, padding: "0.65rem", background: "var(--color-surface-muted)", borderRadius: "0.375rem" });
export const Notice = styled("p", { fontSize: "0.875rem", lineHeight: 1.5, padding: "1rem 0", overflowWrap: "anywhere" });
export const Pagination = styled("nav", { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.875rem" });
