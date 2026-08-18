import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",
});

export const Header = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Muted = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const Filters = styled("form", {
  display: "grid",
  gap: "0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",

  "@sm": {
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto",
    alignItems: "end",
  },
});

export const FilterActions = styled("div", {
  display: "flex",
});

export const TableCard = styled("section", {
  overflow: "hidden",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
});

export const TableScroll = styled("div", {
  overflowX: "auto",
});

export const Table = styled("table", {
  width: "100%",
  minWidth: "58rem",
  borderCollapse: "collapse",
  fontSize: "0.875rem",

  th: {
    background: "var(--color-surface-muted)",
    padding: "0.75rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--color-muted)",
  },

  td: {
    borderTop: "1px solid var(--color-border)",
    padding: "0.75rem",
    verticalAlign: "middle",
  },

  "tbody tr:hover": {
    background: "var(--color-background)",
  },
});

export const Actions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",

  button: {
    height: "2.25rem",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
  },
});

export const ActionLink = styled("a", {
  display: "inline-flex",
  height: "2.25rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  borderRadius: "0.375rem",
  background: "#16a34a",
  padding: "0 0.75rem",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 600,

  "&:hover": {
    background: "#15803d",
  },
});

export const Empty = styled("div", {
  borderTop: "1px solid var(--color-border)",
  padding: "2rem 1rem",
  textAlign: "center",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Pagination = styled("footer", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  padding: "0.75rem 1rem",

  div: {
    display: "flex",
    gap: "0.5rem",
  },

  button: {
    height: "2.25rem",
  },
});

export const PaginationInfo = styled("p", {
  fontSize: "0.8rem",
  color: "var(--color-muted)",
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
  width: "100%",
  maxWidth: "46rem",
  maxHeight: "calc(100vh - 2rem)",
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
  maxHeight: "calc(100vh - 8rem)",
  overflowY: "auto",
  padding: "1rem",
});

export const DetailsGrid = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const InfoCard = styled("div", {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "start",
  gap: "0.65rem",
  borderRadius: "0.375rem",
  background: "var(--color-surface-muted)",
  padding: "0.75rem",

  svg: {
    marginTop: "0.1rem",
    color: "var(--color-primary)",
  },

  "&[data-wide]": {
    "@sm": {
      gridColumn: "1 / -1",
    },
  },
});

export const InfoLabel = styled("p", {
  fontSize: "0.7rem",
  color: "var(--color-muted)",
});

export const InfoValue = styled("p", {
  fontSize: "0.9rem",
  fontWeight: 700,
});

export const AddressText = styled("p", {
  fontSize: "0.875rem",
  lineHeight: 1.5,
});
