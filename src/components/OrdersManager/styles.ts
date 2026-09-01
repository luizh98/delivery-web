import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",

  "&:fullscreen": {
    height: "100vh",
    alignContent: "start",
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
  overflow: "visible",
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
    gridTemplateColumns: "minmax(0, 2fr) minmax(14rem, 1fr)",
  },
});

export const DateFilterWrap = styled("div", {
  position: "relative",
  minWidth: 0,
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

  "@xl": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },

  "@(min-width: 1536px)": {
    '[data-fullscreen="true"] &': {
      gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    },
  },
});

export const Card = styled("article", {
  minWidth: 0,
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  outline: "3px solid transparent",
  outlineOffset: "2px",
  background: "var(--color-surface)",
  padding: "1rem",
  transition: "outline-color 150ms ease",

  variants: {
    overdue: {
      true: {
        position: "relative",
        border: "2px solid #dc2626",
        outlineColor: "#ef4444",
        boxShadow: "0 0 0 2px #ef4444, 0 0 10px rgb(239 68 68 / 0.75)",

        "&::after": {
          position: "absolute",
          zIndex: 1,
          top: "-3px",
          right: "-3px",
          bottom: "-3px",
          left: "-3px",
          border: "2px solid #ff3131",
          borderRadius: "0.5rem",
          content: "",
          pointerEvents: "none",
          animation: "overdue-neon-pulse 1.8s ease-in-out infinite",
        },
      },
    },
  },

  "&:hover, &:focus-within": {
    outlineColor: "var(--color-primary)",
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

  "&:focus-visible": {
    outline: "none",
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

  variants: {
    overdue: {
      true: {
        color: "#dc2626",
        fontWeight: 700,
      },
    },
  },
});

export const CardFooter = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const CardTotal = styled("strong", {
  fontSize: "0.9rem",
  color: "#111827",
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
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  overflow: "hidden",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "0 24px 48px rgb(0 0 0 / 0.2)",
});

export const DatePopover = styled("div", {
  position: "absolute",
  top: "calc(100% + 0.65rem)",
  right: 0,
  zIndex: 40,
  display: "grid",
  width: "min(22rem, calc(100vw - 2rem))",
  maxHeight: "min(36rem, calc(100vh - 2rem))",
  gridTemplateRows: "auto minmax(0, 1fr)",
  overflow: "visible",
  borderRadius: "0.625rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  boxShadow: "0 14px 32px rgb(15 23 42 / 0.18)",

  "&::before": {
    position: "absolute",
    top: "-0.35rem",
    right: "1.5rem",
    width: "0.7rem",
    height: "0.7rem",
    borderTop: "1px solid var(--color-border)",
    borderLeft: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    content: "",
    transform: "rotate(45deg)",
  },
});

export const DatePopoverHeader = styled("header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  borderBottom: "1px solid var(--color-border)",
  padding: "0.65rem 0.75rem",
});

export const DatePopoverBody = styled("div", {
  display: "grid",
  gap: "0.65rem",
  maxHeight: "calc(100vh - 8rem)",
  overflowY: "auto",
  padding: "0.65rem 0.75rem 0.75rem",
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

export const ModalFooter = styled("footer", {
  display: "grid",
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  padding: "1rem",
});

export const CalendarPanel = styled("div", {
  display: "grid",
  placeItems: "center",
  overflowX: "auto",

  ".rdp-root": {
    "--rdp-accent-color": "var(--color-primary)",
    "--rdp-accent-background-color": "color-mix(in srgb, var(--color-secondary) 22%, transparent)",
    "--rdp-selected-border": "2px solid var(--color-primary)",
    "--rdp-range_middle-background-color": "color-mix(in srgb, var(--color-secondary) 30%, transparent)",
    "--rdp-range_middle-color": "var(--color-foreground)",
    "--rdp-range_start-date-background-color": "var(--color-primary)",
    "--rdp-range_end-date-background-color": "var(--color-primary)",
    "--rdp-today-color": "var(--color-secondary)",
    "--rdp-day-height": "36px",
    "--rdp-day-width": "36px",
    "--rdp-day_button-height": "34px",
    "--rdp-day_button-width": "34px",
    "--rdp-nav_button-height": "2rem",
    "--rdp-nav_button-width": "2rem",
    fontSize: "0.825rem",
  },
});

export const DateRangeText = styled("p", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--color-foreground)",

  svg: {
    color: "var(--color-primary)",
  },
});

export const DateModalActions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
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
