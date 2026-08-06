import { styled } from "styles";

export const HistoryContent = styled("section", {
  display: "grid",
  width: "100%",
  maxWidth: "40rem",
  margin: "0 auto",
  gap: "1rem",
});

export const HistoryHeader = styled("header", {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "center",
  gap: "0.75rem",
});

export const HistoryHeading = styled("div", {
  display: "grid",
  minWidth: 0,
  gap: "0.375rem",
});

export const HistoryTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const HistoryDescription = styled("p", {
  color: "var(--color-muted)",
  fontSize: "0.875rem",
  lineHeight: 1.5,
});

export const HistoryList = styled("ol", {
  display: "grid",
  gap: "0.75rem",
});

export const HistoryCard = styled("button", {
  display: "grid",
  width: "100%",
  gap: "0.875rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "1rem",
  color: "var(--color-foreground)",
  textAlign: "left",
  cursor: "pointer",

  "&:hover": {
    borderColor: "var(--color-primary)",
  },

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "2px",
  },
});

export const CardHeader = styled("span", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const OrderIdentity = styled("span", {
  display: "grid",
  minWidth: 0,
  gap: "0.125rem",
});

export const OrderNumber = styled("strong", {
  overflow: "hidden",
  fontSize: "1rem",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const OrderDate = styled("span", {
  color: "var(--color-muted)",
  fontSize: "0.75rem",
});

export const StatusBadge = styled("span", {
  display: "inline-flex",
  flexShrink: 0,
  alignItems: "center",
  borderRadius: "9999px",
  padding: "0.25rem 0.625rem",
  fontSize: "0.75rem",
  fontWeight: 700,

  variants: {
    tone: {
      active: {
        background: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
        color: "var(--color-primary)",
      },
      completed: {
        background: "#dcfce7",
        color: "#15803d",
      },
      canceled: {
        background: "#fee2e2",
        color: "#b91c1c",
      },
    },
  },
});

export const CardDetails = styled("span", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
});

export const CardDetail = styled("span", {
  display: "grid",
  minWidth: 0,
  gap: "0.125rem",
});

export const DetailLabel = styled("span", {
  color: "var(--color-muted)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

export const DetailValue = styled("strong", {
  overflow: "hidden",
  fontSize: "0.875rem",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const CardAction = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
  color: "var(--color-primary)",
  fontSize: "0.875rem",
  fontWeight: 700,
});

export const Notice = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  border: "1px solid #f59e0b",
  borderRadius: "0.75rem",
  background: "#fffbeb",
  padding: "0.75rem",
  color: "#92400e",
  fontSize: "0.8125rem",
  lineHeight: 1.5,

  svg: {
    flexShrink: 0,
    marginTop: "0.125rem",
  },
});

export const StateCard = styled("section", {
  display: "grid",
  justifyItems: "center",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "2rem 1rem",
  textAlign: "center",
});

export const StateIcon = styled("span", {
  display: "grid",
  width: "3rem",
  height: "3rem",
  placeItems: "center",
  borderRadius: "9999px",
  background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
  color: "var(--color-primary)",
});

export const StateTitle = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const StateText = styled("p", {
  maxWidth: "28rem",
  color: "var(--color-muted)",
  fontSize: "0.875rem",
  lineHeight: 1.5,
});

export const StateActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.75rem",
});
