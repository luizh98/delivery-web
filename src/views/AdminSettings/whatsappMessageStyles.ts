import { styled } from "styles";

export const MessagePanel = styled("section", {
  display: "grid", gap: "0.75rem", minWidth: 0,
  "& h4": { fontSize: "1rem", fontWeight: 600 },
  "& [data-message-editor]": { display: "grid", gap: "1rem", minWidth: 0, padding: "0.5rem 0 1.25rem" },
  "& textarea": { lineHeight: 1.65, resize: "vertical", minHeight: "16rem", caretColor: "var(--color-primary)", scrollMarginTop: "5rem" },
  "& textarea::selection": { background: "var(--color-primary)", color: "var(--color-primary-foreground)" },
});

export const MessageList = styled("ul", {
  listStyle: "none", padding: 0, margin: 0,
  "& > li": { borderBottom: "1px solid var(--color-border)" },
  "& > li > button, & [data-connection-row]": { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem 1rem", width: "100%", textAlign: "left", padding: "0.875rem 0", color: "var(--color-foreground)", fontSize: "0.875rem" },
  "& > li > button": { cursor: "pointer", border: 0, background: "transparent" },
  "& > li > button > span:first-child, & [data-connection-row] > span, & [data-connection-row] > a": { display: "inline-flex", alignItems: "center", gap: "0.5rem" },
  "& > li > button > span:first-child > svg": { flexShrink: 0 },
  "& [data-message-actions]": { display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", gap: "0.5rem 1rem", marginLeft: "auto" },
  "& [data-message-actions] > span": { display: "inline-flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 },
  "& [data-message-actions] > small, & [data-connection-row] > small": { color: "var(--color-muted)", fontSize: "0.8125rem", lineHeight: 1.5 },
  "& > li > button:hover, & > li > button[aria-expanded=true]": { color: "var(--color-primary)" },
  "& > li > button:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
  "& > li > button:disabled": { opacity: 0.6, cursor: "wait" },
});

export const MessageToolbar = styled("div", {
  display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem",
  "& > span": { fontSize: "0.8125rem", color: "var(--color-muted)" },
  "& select": { width: "auto", minWidth: "8rem" },
});

export const ParameterList = styled("div", {
  display: "flex", flexWrap: "wrap", gap: "0.5rem",
  "& button": { display: "inline-flex", alignItems: "center", gap: "0.25rem", minHeight: "2.75rem", padding: "0.5rem 0.75rem", border: "1px solid var(--color-border)", borderRadius: "999px", background: "var(--color-background)", color: "var(--color-foreground)", fontSize: "0.8125rem", cursor: "grab" },
  "& button:hover": { borderColor: "var(--color-primary)", color: "var(--color-primary)" },
  "& button:active": { cursor: "grabbing" },
  "& button:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "2px" },
  "& button:disabled": { opacity: 0.6, cursor: "wait" },
});

export const MessagePreview = styled("div", {
  display: "grid", gap: "0.875rem", minWidth: 0, paddingBlock: "1.25rem", borderBlock: "1px solid var(--color-border)",
});

export const MessageBody = styled("div", {
  justifySelf: "end", width: "100%", maxWidth: "34rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: "1rem 1.25rem", border: "1px solid var(--color-border)", borderRadius: "12px 12px 0 12px", color: "var(--color-foreground)", fontSize: "0.9375rem", lineHeight: 1.65,
});
