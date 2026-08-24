import { styled } from "styles";

export const Root = styled("main", {
  display: "grid",
  gap: "1rem",
  width: "100%",
});

export const Title = styled("h1", {
  fontSize: "1.5rem",
  fontWeight: 700,
});

export const Subtitle = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Panel = styled("section", {
  display: "grid",
  gap: "1rem",
  padding: "1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  background: "var(--color-surface)",
});

export const PanelHeader = styled("div", {
  display: "grid",
  gap: "0.25rem",
});

export const PanelTitle = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const PanelDescription = styled("p", {
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const DownloadActions = styled("div", {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const DownloadLink = styled("a", {
  display: "inline-flex",
  minHeight: "2.75rem",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  padding: "0.625rem 1rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-foreground)",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  variants: {
    primary: {
      true: {
        borderColor: "var(--color-primary)",
        background: "var(--color-primary)",
        color: "#ffffff",

        "&:hover": {
          opacity: 0.9,
          background: "var(--color-primary)",
        },
      },
    },
  },
});

export const StepList = styled("ol", {
  display: "grid",
  gap: "0.875rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

export const Step = styled("li", {
  display: "grid",
  gridTemplateColumns: "2rem minmax(0, 1fr)",
  gap: "0.75rem",
  alignItems: "start",
});

export const StepNumber = styled("span", {
  display: "inline-flex",
  width: "2rem",
  height: "2rem",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
  color: "var(--color-primary)",
  fontSize: "0.8125rem",
  fontWeight: 700,
});

export const StepContent = styled("div", {
  display: "grid",
  gap: "0.2rem",
});

export const StepTitle = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const StepDescription = styled("p", {
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const PathCode = styled("code", {
  display: "inline-block",
  maxWidth: "100%",
  padding: "0.125rem 0.375rem",
  borderRadius: "0.25rem",
  background: "var(--color-surface-muted)",
  color: "var(--color-foreground)",
  fontSize: "0.75rem",
  overflowWrap: "anywhere",
});

export const SecurityNote = styled("p", {
  padding: "0.75rem",
  borderRadius: "0.375rem",
  background: "#f0fdf4",
  color: "#166534",
  fontSize: "0.8125rem",
  lineHeight: 1.5,
});

export const Status = styled("p", {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  width: "fit-content",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const StatusDot = styled("span", {
  width: "0.625rem",
  height: "0.625rem",
  borderRadius: "999px",
  background: "#dc2626",

  variants: {
    connected: {
      true: { background: "#16a34a" },
    },
  },
});

export const Actions = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const Help = styled("p", {
  fontSize: "0.8125rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
});

export const ErrorText = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});
