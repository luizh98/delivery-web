import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",
});

export const PageHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const PageTitle = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const PageSubtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const CampaignList = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const CampaignCard = styled("article", {
  display: "grid",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
  padding: "0.875rem",

  "@md": {
    gridTemplateColumns: "minmax(0, 1fr) auto",
  },
});

export const CampaignName = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const CampaignMeta = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem 0.75rem",
  marginTop: "0.35rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const Status = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid",
  borderRadius: "3px",
  padding: "0.1rem 0.35rem",
  fontSize: "0.7rem",
  fontWeight: 600,

  variants: {
    active: {
      true: {
        borderColor: "#bbf7d0",
        background: "#f0fdf4",
        color: "#15803d",
      },
      false: {
        borderColor: "#fecaca",
        background: "#fef2f2",
        color: "#b91c1c",
      },
    },
  },
});

export const Actions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.4rem",
});

export const FormCard = styled("section", {
  display: "grid",
  gap: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
  padding: "1rem",
});

export const StepNav = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "0.25rem",
});

export const StepButton = styled("button", {
  minHeight: "2.5rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  padding: "0.35rem",
  fontSize: "0.72rem",
  fontWeight: 600,

  variants: {
    active: {
      true: {
        borderColor: "var(--color-primary)",
        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
        color: "var(--color-primary)",
      },
      false: {
        background: "var(--color-background)",
      },
    },
  },
});

export const StepContent = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const GridTwo = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

export const Checkbox = styled("label", {
  display: "flex",
  minHeight: "2.5rem",
  alignItems: "center",
  gap: "0.5rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-background)",
  padding: "0.55rem 0.7rem",
  fontSize: "0.82rem",

  input: {
    accentColor: "var(--color-primary)",
  },
});

export const ChoiceList = styled("div", {
  display: "grid",
  maxHeight: "18rem",
  gap: "0.35rem",
  overflowY: "auto",
});

export const OrderedItem = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  padding: "0.5rem 0.65rem",
  fontSize: "0.82rem",
});

export const OfferCard = styled("section", {
  display: "grid",
  gap: "0.75rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const OfferHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
});

export const WeekdayDetails = styled("details", {
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.65rem",

  summary: {
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
  },
});

export const WeekdayGrid = styled("div", {
  display: "grid",
  gap: "0.45rem",
  marginTop: "0.65rem",
});

export const WeekdayRow = styled("div", {
  display: "grid",
  alignItems: "center",
  gap: "0.5rem",

  "@sm": {
    gridTemplateColumns: "minmax(0, 1fr) minmax(10rem, 1fr)",
  },
});

export const FormActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  marginTop: "1.25rem",
  paddingTop: "1rem",
});

export const Empty = styled("div", {
  border: "1px dashed var(--color-border)",
  borderRadius: "0.375rem",
  padding: "1rem",
  color: "var(--color-muted)",
  fontSize: "0.875rem",
});

export const ErrorText = styled("p", {
  color: "#dc2626",
  fontSize: "0.8rem",
});
