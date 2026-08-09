import { styled } from "styles";

export const AccountContent = styled("section", {
  display: "grid",
  width: "100%",
  maxWidth: "28rem",
  margin: "0 auto",
  gap: "1rem",
});

export const AccountCard = styled("div", {
  display: "grid",
  gap: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "1.25rem",
});

export const AccountHeader = styled("header", { display: "grid", gap: "0.375rem" });
export const AccountTitle = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const AccountText = styled("p", {
  color: "var(--color-muted)",
  fontSize: "0.875rem",
  lineHeight: 1.5,
});
export const AccountForm = styled("form", { display: "grid", gap: "0.875rem" });
export const AccountActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
});
export const AccountLink = styled("button", {
  border: 0,
  background: "transparent",
  padding: 0,
  color: "var(--color-primary)",
  font: "inherit",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
});
export const AccountError = styled("p", { color: "#b91c1c", fontSize: "0.875rem" });
export const AccountSuccess = styled("p", { color: "#15803d", fontSize: "0.875rem" });
export const AccountDetails = styled("dl", { display: "grid", gap: "0.75rem" });
export const AccountDetail = styled("div", { display: "grid", gap: "0.125rem" });
export const AccountLabel = styled("dt", { color: "var(--color-muted)", fontSize: "0.75rem" });
export const AccountValue = styled("dd", { fontWeight: 700 });
