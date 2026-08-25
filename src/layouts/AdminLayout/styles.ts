import { styled } from "styles";

export const Root = styled("div", {
  minHeight: "100vh",
  background: "var(--color-background)",
});

export const Header = styled("header", {
  position: "sticky",
  top: 0,
  zIndex: 20,
  borderBottom: "1px solid var(--color-border)",
  background: "var(--color-surface)",
});

export const HeaderInner = styled("div", {
  display: "flex",
  maxWidth: "72rem",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  margin: "0 auto",
  padding: "0.75rem 1rem",

  "@sm": {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
  },
});

export const Tenant = styled("p", {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "var(--color-muted)",
});

export const Email = styled("p", {
  fontWeight: 700,
});

export const Nav = styled("nav", {
  display: "flex",
  maxWidth: "72rem",
  gap: "0.25rem",
  overflowX: "auto",
  margin: "0 auto",
  padding: "0 1rem 0.75rem",

  "@sm": {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
  },
});

export const Brand = styled("a", {
  display: "inline-flex",
  minWidth: "max-content",
  alignItems: "center",
  marginRight: "0.5rem",
  paddingRight: "0.75rem",
  borderRight: "1px solid var(--color-border)",
  fontSize: "1.125rem",
  fontWeight: 800,
});

export const NavLink = styled("a", {
  display: "inline-flex",
  height: "2.5rem",
  minWidth: "max-content",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  fontWeight: 600,

  "&:hover": {
    background: "var(--color-surface-muted)",
  },
});
