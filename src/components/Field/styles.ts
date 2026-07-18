import { styled } from "styles";

const controlBase = {
  height: "2.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  transition: "box-shadow 150ms ease",

  "&:focus": {
    boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-primary) 20%, transparent)",
  },
};

export const FieldRoot = styled("label", {
  display: "grid",
  gap: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-foreground)",
});

export const ErrorMessage = styled("span", {
  fontSize: "0.75rem",
  color: "#dc2626",
});

export const InputRoot = styled("input", controlBase);

export const TextareaRoot = styled("textarea", {
  ...controlBase,
  minHeight: "6rem",
  paddingTop: "0.5rem",
  paddingBottom: "0.5rem",

  variants: {
    mono: {
      true: {
        fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      },
    },
  },
});

export const SelectRoot = styled("select", controlBase);
