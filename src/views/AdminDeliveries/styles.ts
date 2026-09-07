import { styled } from "styles";

export const Root = styled("div", { display: "grid", gap: "1rem" });
export const Header = styled("header", {
  display: "flex", alignItems: "end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
});
export const Title = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const Subtitle = styled("p", { fontSize: "0.875rem", color: "var(--color-muted)" });
export const Toolbar = styled("div", {
  display: "flex", alignItems: "end", gap: "0.75rem", flexWrap: "wrap",
  padding: "0.875rem", border: "1px solid var(--color-border)", borderRadius: "0.5rem", background: "var(--color-surface)",
});
export const MotoboyForm = styled("form", { display: "flex", alignItems: "end", gap: "0.5rem", flexWrap: "wrap" });
export const Board = styled("div", {
  display: "grid", gap: "1rem", "@md": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
});
export const CourierColumn = styled("section", {
  display: "grid", alignContent: "start", gap: "0.75rem", minWidth: 0,
  border: "1px solid var(--color-border)", borderRadius: "0.5rem", background: "var(--color-surface)", padding: "1rem",
});
export const CourierHeader = styled("header", {
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem",
  borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem",
});
export const CourierName = styled("h2", { fontSize: "1rem", fontWeight: 700 });
export const RouteCard = styled("article", {
  display: "grid", gap: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "0.375rem", padding: "0.75rem",
});
export const RouteHeader = styled("div", { display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "start" });
export const RouteTitle = styled("strong", { fontSize: "0.875rem" });
export const RouteStatus = styled("span", {
  borderRadius: "999px", background: "var(--color-background)", padding: "0.25rem 0.5rem", fontSize: "0.65rem", fontWeight: 700,
});
export const OrderList = styled("div", { display: "grid", gap: "0.5rem" });
export const OrderRow = styled("div", { display: "grid", gap: "0.15rem", borderLeft: "3px solid var(--color-primary)", paddingLeft: "0.6rem" });
export const OrderTitle = styled("strong", { fontSize: "0.8125rem" });
export const OrderMeta = styled("span", { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.7rem", color: "var(--color-muted)" });
export const RouteFooter = styled("div", { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.75rem" });
export const Actions = styled("div", { display: "flex", alignItems: "end", gap: "0.5rem", flexWrap: "wrap" });
export const Waiting = styled("div", { display: "grid", gap: "0.2rem", color: "#b45309", fontSize: "0.75rem", fontWeight: 600 });
export const Empty = styled("div", { minHeight: "12rem", display: "grid", placeItems: "center", color: "var(--color-muted)", fontSize: "0.875rem" });
export const ErrorText = styled("p", { color: "#dc2626", fontSize: "0.8125rem" });
