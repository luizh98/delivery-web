import { styled } from "styles";

export const Form = styled("form", {
  display: "grid",
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

export const Accordion = styled("details", {
  overflow: "hidden",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",

  "&[open] > summary [data-accordion-icon]": {
    transform: "rotate(180deg)",
  },
});

export const AccordionSummary = styled("summary", {
  display: "flex",
  minHeight: "4rem",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.875rem 1rem",
  listStyle: "none",

  "&::-webkit-details-marker": {
    display: "none",
  },

  "&:focus-visible": {
    outline: "2px solid var(--color-primary)",
    outlineOffset: "-2px",
  },
});

export const AccordionSummaryText = styled("span", {
  display: "grid",
  gap: "0.125rem",

  strong: {
    fontSize: "0.9375rem",
  },

  span: {
    fontSize: "0.75rem",
    color: "var(--color-muted)",
  },
});

export const AccordionIcon = styled("span", {
  display: "grid",
  flexShrink: 0,
  placeItems: "center",
  color: "var(--color-muted)",
  transition: "transform 150ms ease",
});

export const AccordionBody = styled("div", {
  display: "grid",
  gap: "1rem",
  borderTop: "1px solid var(--color-border)",
  padding: "1rem",
});

export const GridTwo = styled("div", {
  display: "grid",
  alignItems: "start",
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
    gridTemplateColumns: "9rem 12rem minmax(0, 1fr)",
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
    position: "relative",
    width: "4.5rem",
    height: "1.75rem",
    flexShrink: 0,
    appearance: "none",
    border: "1px solid var(--color-border)",
    borderRadius: "9999px",
    background: "var(--color-surface-muted)",
    cursor: "pointer",
    transition: "background 150ms ease, border-color 150ms ease",

    "&::before": {
      position: "absolute",
      top: "0.1875rem",
      left: "0.1875rem",
      zIndex: 1,
      width: "1.25rem",
      height: "1.25rem",
      borderRadius: "9999px",
      background: "#ffffff",
      boxShadow: "0 1px 3px rgb(0 0 0 / 0.25)",
      content: "",
      transition: "transform 150ms ease",
    },

    "&::after": {
      position: "absolute",
      top: "50%",
      right: "0.5rem",
      color: "var(--color-muted)",
      content: '"NÃO"',
      fontSize: "0.625rem",
      fontWeight: 800,
      lineHeight: 1,
      transform: "translateY(-50%)",
    },

    "&:checked": {
      borderColor: "var(--color-primary)",
      background: "var(--color-primary)",
    },

    "&:checked::before": {
      transform: "translateX(2.6875rem)",
    },

    "&:checked::after": {
      right: "auto",
      left: "0.55rem",
      color: "#ffffff",
      content: '"SIM"',
    },

    "&:focus-visible": {
      outline: "2px solid var(--color-primary)",
      outlineOffset: "2px",
    },
  },
});

export const MediaUploadGrid = styled("div", {
  display: "grid",
  alignItems: "start",
  gap: "1rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const MediaActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
});

export const MediaPreview = styled("div", {
  width: "100%",
  height: "8rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  backgroundColor: "var(--color-surface-muted)",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",

  variants: {
    compact: {
      true: {
        width: "8rem",
        backgroundSize: "contain",
      },
      false: {},
    },
  },
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const ColorFields = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0.75rem",

  input: {
    minHeight: "3rem",
    padding: "0.25rem",
  },
});

export const AppearanceLayout = styled("div", {
  display: "grid",
  gap: "1rem",

  "@md": {
    gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
    alignItems: "stretch",
    gap: "1.5rem",
  },
});

export const AppearanceControls = styled("div", {
  display: "grid",
  alignContent: "start",
});

export const AppearanceDivider = styled("div", {
  width: "100%",
  height: "1px",
  background: "var(--color-border)",

  "@md": {
    width: "1px",
    height: "100%",
    minHeight: "24rem",
  },
});

export const ThemePreview = styled("div", {
  width: "100%",
  maxWidth: "none",
  overflow: "hidden",
  justifySelf: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  background: "#ffffff",
  boxShadow: "0 12px 30px rgb(15 23 42 / 0.12)",
  color: "#171717",
});

export const ThemePreviewBanner = styled("div", {
  height: "7rem",
  backgroundPosition: "center",
  backgroundSize: "cover",
});

export const ThemePreviewBody = styled("div", {
  display: "grid",
  gap: "0.625rem",
  padding: "0.875rem",

  "> strong": {
    fontSize: "1rem",
  },

  "> span": {
    fontSize: "0.6875rem",
    color: "#64748b",
  },

  "> div": {
    display: "flex",
    gap: "0.375rem",
  },
});

export const ThemePreviewCategory = styled("span", {
  borderRadius: "0.375rem",
  background: "var(--preview-primary)",
  padding: "0.375rem 0.625rem",
  fontSize: "0.625rem",
  fontWeight: 700,
  color: "#ffffff",
});

export const ThemePreviewProduct = styled("div", {
  display: "grid !important",
  gridTemplateColumns: "1fr 4rem",
  gap: "0.5rem !important",
  border: "1px solid #e2e8f0",
  borderRadius: "0.375rem",
  padding: "0.625rem",

  "> div:first-child": {
    display: "grid",
    alignContent: "start",
    gap: "0.2rem",
  },

  strong: {
    fontSize: "0.6875rem",
  },

  span: {
    fontSize: "0.5625rem",
    color: "#64748b",
  },

  b: {
    fontSize: "0.6875rem",
    color: "var(--preview-primary)",
  },
});

export const ThemePreviewProductImage = styled("span", {
  height: "4rem",
  borderRadius: "0.375rem",
  background: "linear-gradient(135deg, color-mix(in srgb, var(--preview-secondary) 35%, #ffffff), var(--preview-secondary))",
});

export const ThemePreviewCart = styled("div", {
  display: "block !important",
  borderRadius: "0.375rem",
  background: "var(--preview-primary)",
  padding: "0.625rem",
  fontSize: "0.6875rem",
  fontWeight: 700,
  color: "#ffffff",
  textAlign: "center",
});

export const RangeList = styled("div", {
  display: "grid",
  gap: "0.75rem",
  paddingTop: "0.25rem",
});

export const RangeActions = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const RangeRow = styled("div", {
  display: "grid",
  gap: "0.75rem",
  alignItems: "end",
  padding: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",

  "@sm": {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr)) auto",
  },
});

export const RangeOptions = styled("div", {
  display: "flex",
  alignItems: "center",
  gridColumn: "1 / -1",
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
