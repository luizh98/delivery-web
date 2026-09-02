import { styled } from "styles";

export const Root = styled("div", {
  minHeight: "100dvh",
  background: "var(--color-background)",

  "@lg": {
    display: "grid",
    gridTemplateColumns: "5rem minmax(0, 1fr)",
  },
});

export const Content = styled("div", {
  minWidth: 0,
});

export const Sidebar = styled("aside", {
  display: "none",

  "@lg": {
    position: "sticky",
    top: 0,
    display: "flex",
    height: "100dvh",
    flexDirection: "column",
    borderRight: "1px solid var(--color-border)",
    background: "var(--color-surface)",
  },
});

export const SidebarHeader = styled("div", {
  display: "flex",
  justifyContent: "center",
  padding: "1rem 0",
});

export const MobileHeader = styled("header", {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  height: "4rem",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0 1rem",

  "@lg": {
    display: "none",
  },
});

export const Tenant = styled("p", {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "var(--color-muted)",
});

export const Email = styled("p", {
  overflowWrap: "anywhere",
  marginTop: "0.125rem",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const Nav = styled("nav", {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: "0.25rem",
  overflowY: "auto",
  padding: "0.5rem 0.75rem 1rem",

  "@lg": {
    overflow: "visible",
    paddingLeft: "0.625rem",
    paddingRight: "0.625rem",
  },
});

export const Brand = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  color: "var(--color-foreground)",
  fontSize: "1.25rem",
  fontWeight: 800,
  letterSpacing: "-0.025em",
});

export const CompactBrand = styled(Brand, {
  width: "2.75rem",
  height: "2.75rem",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "0.625rem",
  background: "var(--color-surface)",
  transition: "background-color 160ms ease, border-color 160ms ease",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:focus-visible": {
    outline: "3px solid var(--color-primary)",
    outlineOffset: "2px",
  },
});

export const NavLink = styled("a", {
  display: "inline-flex",
  width: "100%",
  minHeight: "2.75rem",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "0.625rem",
  padding: "0 0.75rem",
  color: "var(--color-foreground)",
  fontSize: "0.9375rem",
  fontWeight: 600,
  lineHeight: 1.25,
  transition: "background-color 160ms ease, color 160ms ease, box-shadow 160ms ease",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:focus-visible": {
    outline: "3px solid var(--color-primary)",
    outlineOffset: "2px",
  },

  "&[data-active='true']": {
    background: "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))",
    color: "var(--color-primary)",
    fontWeight: 700,
  },

  "@lg": {
    position: "relative",
    justifyContent: "center",
    gap: 0,
    padding: 0,

    "& > span": {
      display: "none",
    },

    "&::after": {
      position: "absolute",
      zIndex: 50,
      top: "50%",
      left: "calc(100% + 0.625rem)",
      transform: "translate(-0.25rem, -50%)",
      opacity: 0,
      pointerEvents: "none",
      border: "1px solid var(--color-border)",
      borderRadius: "0.5rem",
      background: "var(--color-surface)",
      boxShadow: "0 8px 20px rgb(15 23 42 / 0.16)",
      padding: "0.5rem 0.625rem",
      color: "var(--color-foreground)",
      content: "attr(data-label)",
      fontSize: "0.8125rem",
      fontWeight: 600,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      transition: "transform 160ms ease, opacity 160ms ease",
    },

    "&:hover::after, &:focus-visible::after": {
      transform: "translate(0, -50%)",
      opacity: 1,
    },
  },
});

export const SidebarFooter = styled("div", {
  display: "grid",
  gap: "0.625rem",
  marginTop: "auto",
  borderTop: "1px solid var(--color-border)",
  padding: "1rem",
});

export const CompactSidebarFooter = styled(SidebarFooter, {
  display: "flex",
  justifyContent: "center",
  padding: "1rem 0.625rem",
});

export const MenuButton = styled("button", {
  display: "inline-flex",
  width: "2.75rem",
  height: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "0.625rem",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  transition: "background-color 160ms ease, border-color 160ms ease",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:focus-visible": {
    outline: "3px solid var(--color-primary)",
    outlineOffset: "2px",
  },
});

export const Overlay = styled("button", {
  position: "fixed",
  zIndex: 30,
  inset: 0,
  border: 0,
  background: "rgb(15 23 42 / 0.48)",
});

export const MobileDrawer = styled("aside", {
  position: "fixed",
  zIndex: 40,
  top: 0,
  bottom: 0,
  left: 0,
  display: "flex",
  width: "min(18rem, calc(100vw - 3.5rem))",
  flexDirection: "column",
  borderRight: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "0 18px 48px rgb(15 23 42 / 0.24)",
  animation: "admin-drawer-enter 180ms ease-out",
});

export const DrawerHeader = styled("div", {
  display: "flex",
  minHeight: "4rem",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid var(--color-border)",
  padding: "0 1rem",
});

export const CloseButton = styled(MenuButton, {
  flexShrink: 0,
});
