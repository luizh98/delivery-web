import { styled } from "styles";

export const Status = styled("main", {
  display: "grid",
  minHeight: "50vh",
  alignContent: "center",
  justifyItems: "center",
  gap: "0.75rem",
  textAlign: "center",
});

export const Title = styled("h1", { fontSize: "1.25rem", fontWeight: 700 });

export const Text = styled("p", {
  maxWidth: "32rem",
  color: "var(--color-muted)",
  fontSize: "0.9rem",
});
