import { styled } from "styles";

export const MessagePanel = styled("section", {
  display: "grid", gap: "1rem", minWidth: 0, borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem",
  "& h3": { fontSize: "1.125rem", fontWeight: 600 },
  "& h4": { fontSize: "1rem", fontWeight: 600 },
  "& #whatsapp-message-editor": { display: "grid", gap: "1rem", minWidth: 0 },
  "& textarea": { lineHeight: 1.65, resize: "vertical", minHeight: "16rem", caretColor: "var(--color-primary)", scrollMarginTop: "5rem" },
  "& textarea::selection": { background: "var(--color-primary)", color: "var(--color-primary-foreground)" },
});

export const MessageList = styled("ul", {
  listStyle: "none", padding: 0, margin: 0,
  "& li": { borderBottom: "1px solid var(--color-border)" },
  "& button": { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", width: "100%", textAlign: "left", padding: "1rem 0", color: "var(--color-foreground)", cursor: "pointer", border: 0, background: "transparent" },
  "& button > span:first-child": { display: "grid", gap: "0.375rem" },
  "& button > span:last-child": { display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", flexShrink: 0 },
  "& small": { color: "var(--color-muted)", fontSize: "0.8125rem", lineHeight: 1.5 },
  "& button:hover, & button[aria-expanded=true]": { color: "var(--color-primary)" },
  "& button:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "3px" },
  "& button:disabled": { opacity: 0.6, cursor: "wait" },
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
