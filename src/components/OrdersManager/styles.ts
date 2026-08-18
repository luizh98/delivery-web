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
});

export const OrderHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
});

export const CustomerName = styled("h2", {
  fontWeight: 700,
});

export const StatusBadge = styled("span", {
  borderRadius: "0.375rem",
  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-primary)",
});

export const MutedTiny = styled("span", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const MutedText = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
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
  display: "flex",
  flexWrap: "wrap",
  gap: "0.375rem",
});

export const Item = styled("p", {
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.3rem 0.5rem",
  fontSize: "0.875rem",
});

export const Total = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "var(--color-primary)",
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
