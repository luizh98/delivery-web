import { styled } from "styles";

export const ReportLinks = styled("div", {
  display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
  "& a": {
    display: "inline-flex", alignItems: "center", gap: "0.5rem", minHeight: "2.75rem",
    padding: "0.5rem 0.875rem", border: "1px solid var(--color-border)", borderRadius: "0.375rem",
    fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
    "&:hover": { background: "var(--color-background)", borderColor: "var(--color-primary)" },
    "&:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
  },
});

export const ReportRoot = styled("div", {
  display: "grid", gap: "1.25rem", minWidth: 0, fontVariantNumeric: "tabular-nums",
});

export const Filters = styled("div", {
  display: "grid", gap: "0.75rem", alignItems: "end",
  "@sm": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  "@lg": { gridTemplateColumns: "minmax(0, 19rem) minmax(12rem, 1fr)" },
  "& > *": { minWidth: 0 },
});

export const Summary = styled("dl", {
  display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1.25rem",
  padding: "1.25rem 0", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)",
  "@lg": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  "& dt": { fontSize: "0.8125rem", color: "var(--color-muted)", marginBottom: "0.5rem" },
  "& dd": { margin: 0, fontSize: "1.375rem", fontWeight: 700, overflowWrap: "anywhere" },
});

export const ContextLine = styled("div", {
  display: "flex", gap: "0.5rem 1.5rem", flexWrap: "wrap", fontSize: "0.875rem",
  "& strong": { fontWeight: 600 },
});

export const ReportNote = styled("p", {
  fontSize: "0.8125rem", lineHeight: 1.6, color: "var(--color-muted)", maxWidth: "75ch",
});

export const Warning = styled("p", {
  padding: "0.875rem", border: "1px solid var(--color-border)", borderRadius: "0.375rem",
  fontSize: "0.875rem", lineHeight: 1.5,
});

export const Ranking = styled("ol", {
  display: "grid", gap: "1rem", listStyle: "none", padding: 0, margin: 0,
});

export const RankingRow = styled("li", {
  display: "grid", gap: "0.5rem", minWidth: 0,
  "@sm": { gridTemplateColumns: "minmax(10rem, 1.3fr) minmax(6rem, 2fr) minmax(5rem, auto)", alignItems: "center", gap: "1rem" },
});

export const RankingLabel = styled("div", {
  display: "grid", gap: "0.2rem", overflowWrap: "anywhere", fontSize: "0.875rem",
  "& small": { color: "var(--color-muted)", fontSize: "0.75rem" },
});

export const BarTrack = styled("div", {
  height: "0.75rem", background: "var(--color-background)", overflow: "hidden", borderRadius: "0.25rem",
});
export const BarFill = styled("div", {
  height: "100%", background: "var(--color-primary)", borderRadius: "inherit",
});
export const RankingValue = styled("strong", {
  fontSize: "0.875rem", "@sm": { textAlign: "right" },
});

export const ReportTable = styled("table", {
  width: "100%", minWidth: "48rem", borderCollapse: "collapse", fontSize: "0.8125rem",
  "& caption": { textAlign: "left", color: "var(--color-muted)", marginBottom: "0.75rem" },
  "& th, & td": { padding: "0.875rem 0.5rem", borderBottom: "1px solid var(--color-border)", textAlign: "right" },
  "& thead th": { color: "var(--color-muted)", fontWeight: 600 },
  "& th:first-child, & td:first-child": { textAlign: "left", minWidth: "13rem", whiteSpace: "normal", overflowWrap: "anywhere" },
  "& tbody th": { fontWeight: 500 },
  "& td": { whiteSpace: "nowrap" },
  "& tbody tr:last-child > *": { borderBottom: 0 },
});
