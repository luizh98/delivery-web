import { styled } from "styles";

export const AccessSection = styled("section", {
  display: "grid", gap: "0.875rem", padding: "1.25rem", minWidth: 0,
  border: "1px solid var(--color-border)", borderRadius: "0.75rem", background: "var(--color-surface)",
  color: "var(--color-foreground)", overflowWrap: "anywhere",
  "& h2": { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.125rem", fontWeight: 700 },
  "& p": { fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "65ch" },
  "& form": { display: "grid", gap: "0.875rem" },
  "& button, & input": { minHeight: "2.75rem" },
  "& button:focus-visible, & input:focus-visible": { outline: "2px solid var(--color-primary-text)", outlineOffset: "3px" },
});
export const AccessPage = styled("main", { width: "100%", maxWidth: "36rem", margin: "0 auto", padding: "1.5rem 1rem 3rem", display: "grid", gap: "1rem" });
export const ShareRow = styled("div", {
  display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.875rem", justifyContent: "space-between",
  "& output": { fontSize: "1.25rem", fontWeight: 800, letterSpacing: "0.08em", userSelect: "all", overflowWrap: "anywhere" },
});
