import { styled } from "styles";

export const Wrap = styled("div", { position: "relative", width: "min(100%, 19rem)" });
export const Popover = styled("div", {
  position: "absolute", zIndex: 30, top: "calc(100% + 0.5rem)", right: 0,
  width: "min(22rem, calc(100vw - 2rem))", border: "1px solid var(--color-border)",
  borderRadius: "0.5rem", background: "var(--color-surface)",
  boxShadow: "0 1rem 2.5rem rgb(0 0 0 / 0.14)",
});
export const PopoverHeader = styled("div", {
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem",
  padding: "0.875rem", borderBottom: "1px solid var(--color-border)",
});
export const PopoverBody = styled("div", { display: "grid", gap: "0.75rem", padding: "0.875rem" });
export const CalendarPanel = styled("div", { overflowX: "auto", display: "grid", justifyContent: "center" });
export const RangeText = styled("p", {
  display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--color-muted)",
});
export const Hint = styled("p", { fontSize: "0.875rem", color: "var(--color-muted)" });
export const Actions = styled("div", { display: "flex", justifyContent: "flex-end", gap: "0.5rem" });
