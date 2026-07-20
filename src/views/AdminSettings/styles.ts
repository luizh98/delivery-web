import { styled } from "styles";

export const Form = styled("form", {
  display: "grid",
  maxWidth: "48rem",
  gap: "1rem",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Section = styled("section", {
  display: "grid",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const GridTwo = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const SectionHeader = styled("div", {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const SectionTitle = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const SectionDescription = styled("p", {
  marginTop: "0.125rem",
  fontSize: "0.8125rem",
  color: "var(--color-muted)",
});

export const HoursList = styled("div", {
  display: "grid",
  borderTop: "1px solid var(--color-border)",
});

export const HoursRow = styled("div", {
  display: "grid",
  gap: "0.75rem",
  padding: "0.875rem 0",
  borderBottom: "1px solid var(--color-border)",

  "@sm": {
    gridTemplateColumns: "9rem 7rem minmax(0, 1fr)",
    alignItems: "center",
  },
});

export const DayName = styled("strong", {
  fontSize: "0.875rem",
});

export const StatusToggle = styled("label", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "fit-content",
  fontSize: "0.8125rem",
  fontWeight: 600,
  cursor: "pointer",

  "& input": {
    width: "1rem",
    height: "1rem",
    accentColor: "var(--color-primary)",
  },
});

export const StatusOptions = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const TimeFields = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.75rem",
});

export const RowError = styled("p", {
  fontSize: "0.75rem",
  color: "#dc2626",

  "@sm": {
    gridColumn: "3",
  },
});

export const EmptyText = styled("p", {
  padding: "0.75rem 0",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const HolidayRow = styled("div", {
  display: "grid",
  gap: "0.75rem",
  padding: "1rem 0",
  borderTop: "1px solid var(--color-border)",
});

export const HolidayHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const HolidayTitle = styled("strong", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.875rem",
});

export const HolidayGrid = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "minmax(9rem, 0.8fr) minmax(12rem, 1.2fr)",
  },
});
