import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",

  "&:fullscreen": {
    height: "100vh",
    overflowY: "auto",
    background: "var(--color-background)",
    padding: "1rem",
  },
});

export const Toolbar = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const ToolbarActions = styled("div", {
  display: "flex",
  gap: "0.5rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const StatusFilters = styled("section", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.4rem",

  "@sm": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },

  "@lg": {
    display: "flex",
  },
});

export const StatusFilter = styled("button", {
  display: "grid",
  flex: "1 1 0",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  minWidth: 0,
  alignItems: "center",
  gap: "0.4rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.55rem 0.65rem",
  textAlign: "left",
  cursor: "pointer",
  transition: "border-color 150ms ease, box-shadow 150ms ease",

  svg: {
    flexShrink: 0,
    color: "var(--color-primary)",
  },

  "&:hover": {
    borderColor: "var(--color-primary)",
  },

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },

  variants: {
    active: {
      true: {
        borderColor: "var(--color-primary)",
        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
        boxShadow: "inset 0 0 0 1px var(--color-primary)",
      },
    },
  },
});

export const StatusFilterLabel = styled("span", {
  overflow: "hidden",
  fontSize: "0.75rem",
  lineHeight: 1.2,
  color: "var(--color-muted)",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const StatusCount = styled("strong", {
  fontSize: "1.5rem",
  lineHeight: 1,
  color: "var(--color-foreground)",
});

export const SearchFilter = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@md": {
    gridTemplateColumns: "minmax(0, 2fr) minmax(9rem, 1fr) minmax(9rem, 1fr)",
  },
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-surface)",
  padding: "1.5rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const List = styled("section", {
  display: "grid",
  gap: "0.75rem",

  "@md": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },

  "@lg": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
});

export const Card = styled("article", {
  minWidth: 0,
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
  transition: "border-color 150ms ease, box-shadow 150ms ease",

  "&:hover": {
    borderColor: "color-mix(in srgb, var(--color-primary) 55%, var(--color-border))",
    boxShadow: "0 8px 18px rgb(15 23 42 / 0.08)",
  },
});

export const CardGrid = styled("div", {
  display: "grid",
  height: "100%",
  gridTemplateRows: "1fr auto",
  gap: "0.75rem",
});

export const OrderInfo = styled("div", {
  display: "grid",
  gap: "0.5rem",
  margin: "-0.5rem",
  borderRadius: "0.375rem",
  padding: "0.5rem",
  cursor: "pointer",
  transition: "background 150ms ease, box-shadow 150ms ease",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:focus-visible": {
    outline: "none",
    boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent)",
  },
});

export const OrderHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const CustomerName = styled("h2", {
  minWidth: 0,
  overflow: "hidden",
  fontWeight: 700,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const DetailRow = styled("div", {
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: "0.45rem",
  fontSize: "0.875rem",

  svg: {
    flexShrink: 0,
    color: "var(--color-primary)",
  },
});

export const CustomerOrderBadge = styled("span", {
  flexShrink: 0,
  borderRadius: "0.25rem",
  background: "var(--color-surface-muted)",
  padding: "0.15rem 0.35rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--color-muted)",
});

export const StatusBadge = styled("span", {
  borderRadius: "0.375rem",
  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-primary)",
});

export const ReceivedTime = styled("p", {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--color-primary)",
});

export const ItemList = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const Item = styled("article", {
  display: "grid",
  gap: "0.3rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-muted)",
  padding: "0.65rem",
  fontSize: "0.875rem",
});

export const ModalProductHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const ModalProductMeta = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const ActionsPanel = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const ButtonRow = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",

  button: {
    flex: "1 1 auto",
  },
});

export const CancelBox = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const ModalOverlay = styled("div", {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "grid",
  placeItems: "center",
  overflowY: "auto",
  background: "rgb(0 0 0 / 0.5)",
  padding: "1rem",
});

export const Modal = styled("div", {
  display: "grid",
  width: "100%",
  maxWidth: "50rem",
  maxHeight: "calc(100vh - 2rem)",
  gridTemplateRows: "auto minmax(0, 1fr)",
  overflow: "hidden",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "0 24px 48px rgb(0 0 0 / 0.2)",
});

export const ModalHeader = styled("header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  borderBottom: "1px solid var(--color-border)",
  padding: "1rem",
});

export const ModalBody = styled("div", {
  display: "grid",
  gap: "1rem",
  overflowY: "auto",
  padding: "1rem",
});

export const ModalSection = styled("section", {
  display: "grid",
  gap: "0.65rem",
});

export const ModalSectionTitle = styled("h3", {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "var(--color-foreground)",

  svg: {
    color: "var(--color-primary)",
  },
});

export const ModalInfoGrid = styled("div", {
  display: "grid",
  gap: "0.5rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const ModalInfo = styled("div", {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.65rem",
  fontSize: "0.875rem",

  "> svg": {
    color: "var(--color-primary)",
  },
});

export const ModalLabel = styled("p", {
  fontSize: "0.7rem",
  color: "var(--color-muted)",
});

export const MapsLink = styled("a", {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  gap: "0.3rem",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--color-primary)",

  "&:hover": {
    textDecoration: "underline",
  },
});

export const Totals = styled("div", {
  display: "grid",
  gap: "0.4rem",
});

export const TotalRow = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  fontSize: "0.875rem",

  variants: {
    emphasis: {
      true: {
        borderTop: "1px solid var(--color-border)",
        marginTop: "0.25rem",
        paddingTop: "0.65rem",
        fontSize: "1rem",
        color: "var(--color-primary)",
      },
    },
  },
});

export const PrintSection = styled("section", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const PrintTitle = styled("h2", {
  fontWeight: 700,
});

export const PrintBody = styled("pre", {
  marginTop: "0.75rem",
  overflow: "auto",
  whiteSpace: "pre-wrap",
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",
  fontSize: "0.875rem",
});
