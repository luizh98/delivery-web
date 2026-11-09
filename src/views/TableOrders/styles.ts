import { styled } from "styles";

export const holdProgressKeyframes = `
  @keyframes table-service-hold { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
export const HoldProgress = styled("span", {
  position: "absolute", inset: "auto 0 0", height: "0.25rem",
  background: "var(--color-primary)", transformOrigin: "left",
  animation: "table-service-hold 3s linear both", pointerEvents: "none",
  "@media (prefers-reduced-motion: reduce)": { animationTimingFunction: "steps(3, end)" },
});
export const Footer = styled("div", {
  display: "flex", justifyContent: "center",
  "& button": { minHeight: "3rem" },
});

export const Root = styled("main", {
  width: "100%", maxWidth: "46rem", margin: "0 auto", padding: "1.5rem 1rem 3rem",
  display: "grid", gap: "1.5rem", minWidth: 0,
  "& a:focus-visible, & button:focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "3px" },
});
export const Header = styled("div", { display: "grid", gap: "0.75rem" });
export const Identity = styled("span", { display: "inline-flex", alignItems: "center", minHeight: "2.75rem", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", background: "color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))", color: "var(--color-foreground)", fontWeight: 700 });
export const StateBadge = styled("span", { display: "inline-flex", padding: "0.375rem 0.625rem", borderRadius: "0.375rem", background: "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))", color: "var(--color-foreground)", fontSize: "0.75rem", fontWeight: 600 });
export const Row = styled("div", { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" });
export const Meta = styled("p", { color: "var(--color-muted)", fontSize: "0.875rem", lineHeight: 1.6 });
export const Orders = styled("div", { display: "grid", gap: "1rem" });
export const Round = styled("article", { border: "1px solid var(--color-border)", borderRadius: "0.75rem", padding: "1rem", display: "grid", gap: "0.875rem", background: "var(--color-surface)", overflowWrap: "anywhere", "& h2": { fontWeight: 700 } });
export const Item = styled("div", { display: "grid", gap: "0.25rem", "& strong": { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } });
export const Total = styled("section", { padding: "1.25rem", borderRadius: "0.75rem", background: "var(--color-primary)", color: "var(--color-primary-foreground)", display: "grid", gap: "0.625rem", "& strong": { fontSize: "1.5rem", fontWeight: 800, fontVariantNumeric: "tabular-nums" }, "& p": { fontSize: "0.875rem", lineHeight: 1.5, color: "inherit" } });
export const Actions = styled("div", { display: "flex", gap: "0.75rem", flexWrap: "wrap", "& button": { flex: "1 1 12rem", minHeight: "3rem" } });
export const Empty = styled("div", { display: "grid", justifyItems: "center", textAlign: "center", gap: "0.75rem", padding: "3rem 0.5rem", "& h2": { fontSize: "1.25rem", fontWeight: 700 }, "& > svg": { color: "var(--color-muted)" } });
export const Notice = styled("p", { padding: "0.875rem 1rem", border: "1px solid var(--color-border)", borderRadius: "0.625rem", lineHeight: 1.6, fontSize: "0.875rem" });
export const Dialog = styled("dialog", {
  margin: "auto", width: "min(30rem, calc(100% - 2rem))", border: "1px solid var(--color-border)", borderRadius: "1rem", padding: "1.5rem", color: "var(--color-foreground)", background: "var(--color-surface)",
  "&::backdrop": { background: "rgb(0 0 0 / 45%)" }, "& h2": { fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }, "& p": { marginBottom: "1.25rem", lineHeight: 1.6 },
});
