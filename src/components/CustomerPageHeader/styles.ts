import { styled } from "styles";

export const Header = styled("header", { display: "grid", gap: "0.5rem" });
export const TitleRow = styled("div", {
  display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap",
});
export const Title = styled("h1", {
  minWidth: 0, fontSize: "1.5rem", fontWeight: 700, overflowWrap: "anywhere",
});
export const Description = styled("p", {
  fontSize: "0.875rem", color: "var(--color-muted)",
});
