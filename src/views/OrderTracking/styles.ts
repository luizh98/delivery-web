import { styled } from "styles";

export const TrackingPageContent = styled("section", {
  display: "grid",
  width: "100%",
  maxWidth: "40rem",
  margin: "0 auto",
  gap: "1rem",
});

export const StatusCard = styled("header", {
  display: "grid",
  justifyItems: "center",
  gap: "0.625rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "1.5rem 1rem",
  textAlign: "center",
});

export const StatusIcon = styled("div", {
  display: "grid",
  width: "4rem",
  height: "4rem",
  placeItems: "center",
  borderRadius: "9999px",

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

export const StatusTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 800,
  lineHeight: 1.2,
});

export const StatusDescription = styled("p", {
  maxWidth: "30rem",
  color: "var(--color-muted)",
  fontSize: "0.9375rem",
  lineHeight: 1.5,
});

export const OrderMeta = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "0.375rem 0.75rem",
  color: "var(--color-muted)",
  fontSize: "0.8125rem",
});

export const TimelineCard = styled("section", {
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "1.25rem",
});

export const SectionTitle = styled("h2", {
  marginBottom: "1rem",
  fontSize: "1rem",
  fontWeight: 700,
});

export const Timeline = styled("ol", {
  display: "grid",
});

export const TimelineItem = styled("li", {
  display: "grid",
  gridTemplateColumns: "2rem minmax(0, 1fr)",
  gap: "0.75rem",
  minWidth: 0,
});

export const TimelineRail = styled("div", {
  display: "grid",
  gridTemplateRows: "2rem minmax(1rem, 1fr)",
  justifyItems: "center",
});

export const TimelineMarker = styled("span", {
  display: "grid",
  width: "2rem",
  height: "2rem",
  placeItems: "center",
  borderRadius: "9999px",
  border: "2px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-muted)",
  fontSize: "0.75rem",
  fontWeight: 700,

  variants: {
    state: {
      completed: {
        borderColor: "var(--color-primary)",
        background: "var(--color-primary)",
        color: "var(--color-surface)",
      },
      current: {
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
        boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent)",
      },
      upcoming: {},
    },
  },
});

export const TimelineLine = styled("span", {
  width: "2px",
  minHeight: "1rem",
  background: "var(--color-border)",

  variants: {
    completed: {
      true: {
        background: "var(--color-primary)",
      },
      false: {},
    },
  },
});

export const TimelineContent = styled("div", {
  minWidth: 0,
  padding: "0.25rem 0 1.25rem",

  variants: {
    state: {
      completed: {
        color: "var(--color-foreground)",
      },
      current: {
        color: "var(--color-primary)",
      },
      upcoming: {
        color: "var(--color-muted)",
      },
    },
  },
});

export const TimelineLabel = styled("strong", {
  display: "block",
  fontSize: "0.9375rem",
});

export const TimelineTime = styled("span", {
  display: "block",
  marginTop: "0.1875rem",
  color: "var(--color-muted)",
  fontSize: "0.75rem",
});

export const SummaryCard = styled("section", {
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "1.25rem",
});

export const SummaryList = styled("dl", {
  display: "grid",
  gap: "0.75rem",
});

export const SummaryRow = styled("div", {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "1rem",
  fontSize: "0.875rem",

  dt: {
    color: "var(--color-muted)",
  },

  dd: {
    textAlign: "right",
    fontWeight: 700,
  },
});

export const Notice = styled("div", {
  borderRadius: "0.75rem",
  padding: "0.875rem 1rem",
  fontSize: "0.875rem",
  lineHeight: 1.5,

  variants: {
    tone: {
      warning: {
        border: "1px solid #f59e0b",
        background: "#fffbeb",
        color: "#92400e",
      },
      danger: {
        border: "1px solid #fca5a5",
        background: "#fef2f2",
        color: "#991b1b",
      },
    },
  },
});

export const Actions = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.75rem",

  button: {
    width: "100%",
  },

  "@bp1": {
    gridTemplateColumns: "1fr",
  },
});

export const EmptyState = styled("section", {
  display: "grid",
  justifyItems: "center",
  gap: "0.875rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  background: "var(--color-surface)",
  padding: "2rem 1rem",
  textAlign: "center",

  p: {
    maxWidth: "28rem",
    color: "var(--color-muted)",
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
});
