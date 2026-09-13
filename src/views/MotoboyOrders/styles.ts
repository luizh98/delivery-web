import { styled } from "styles";

export const Root = styled("main", { display: "grid", gap: "1rem", maxWidth: "56rem" });
export const Header = styled("header", { display: "flex", alignItems: "end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" });
export const Title = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const Subtitle = styled("p", { fontSize: "0.875rem", color: "var(--color-muted)" });
export const Empty = styled("div", { display: "grid", justifyItems: "center", gap: "0.5rem", border: "1px dashed var(--color-border)", borderRadius: "0.5rem", padding: "2rem 1rem", color: "var(--color-muted)", textAlign: "center" });
export const RouteCard = styled("section", { display: "grid", gap: "0.75rem", border: "1px solid var(--color-border)", borderRadius: "0.5rem", background: "var(--color-surface)", padding: "0.875rem" });
export const RouteHeader = styled("header", { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.625rem", fontSize: "0.8125rem", color: "var(--color-muted)" });
export const RouteTitle = styled("h2", { display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "1rem", fontWeight: 700, color: "var(--color-foreground)" });
export const OrderCard = styled("article", { display: "grid", gap: "0.75rem", borderLeft: "3px solid var(--color-primary)", borderRadius: "0.25rem", background: "var(--color-background)", padding: "0.75rem", "@md": { gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center" } });
export const OrderTitle = styled("p", { display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.9375rem", fontWeight: 700, overflowWrap: "anywhere" });
export const Address = styled("p", { display: "flex", alignItems: "start", gap: "0.35rem", marginTop: "0.3rem", fontSize: "0.875rem", lineHeight: 1.45, overflowWrap: "anywhere" });
export const OrderMeta = styled("p", { marginTop: "0.2rem", fontSize: "0.75rem", color: "var(--color-muted)" });
export const OrderActions = styled("div", { display: "flex", flexWrap: "wrap", gap: "0.5rem", "& button": { minHeight: "2.75rem" } });
