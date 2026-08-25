import { styled } from "styles";

export const Root = styled("div", { display: "grid", gap: "1rem" });

export const Header = styled("header", {
  display: "flex", alignItems: "end", justifyContent: "space-between",
  gap: "1rem", flexWrap: "wrap",
});

export const Title = styled("h1", { fontSize: "1.5rem", fontWeight: 700 });
export const Subtitle = styled("p", { fontSize: "0.875rem", color: "var(--color-muted)" });

export const DateFilterWrap = styled("div", {
  position: "relative", width: "min(100%, 19rem)",
});

export const DatePopover = styled("div", {
  position: "absolute", zIndex: 30, top: "calc(100% + 0.5rem)", right: 0,
  width: "min(22rem, calc(100vw - 2rem))", border: "1px solid var(--color-border)",
  borderRadius: "0.5rem", background: "var(--color-surface)",
  boxShadow: "0 1rem 2.5rem rgb(0 0 0 / 0.14)",
});

export const DatePopoverHeader = styled("div", {
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem",
  padding: "0.875rem", borderBottom: "1px solid var(--color-border)",
});

export const DatePopoverBody = styled("div", { display: "grid", gap: "0.75rem", padding: "0.875rem" });
export const CalendarPanel = styled("div", { overflowX: "auto", display: "grid", justifyContent: "center" });
export const DateRangeText = styled("p", {
  display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--color-muted)",
});
export const DateModalActions = styled("div", { display: "flex", justifyContent: "flex-end", gap: "0.5rem" });

export const MetricsGrid = styled("section", {
  display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem",
  "@md": { gridTemplateColumns: "repeat(5, minmax(0, 1fr))" },
});

export const MetricButton = styled("button", {
  minWidth: 0, display: "grid", gap: "0.45rem", textAlign: "left",
  borderRadius: "0.5rem", border: "1px solid var(--color-border)",
  background: "var(--color-surface)", padding: "0.875rem", cursor: "pointer",
  transition: "border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
  "&:hover": { borderColor: "var(--color-primary)", transform: "translateY(-1px)" },
  "&:focus-visible": { outline: "2px solid var(--color-primary)", outlineOffset: "2px" },
  variants: { active: { true: {
    borderColor: "var(--color-primary)", boxShadow: "inset 0 0 0 1px var(--color-primary)",
    background: "color-mix(in srgb, var(--color-primary) 7%, var(--color-surface))",
  } } },
});

export const MetricTop = styled("span", {
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem",
});
export const MetricIcon = styled("span", {
  display: "grid", placeItems: "center", width: "1.9rem", height: "1.9rem",
  borderRadius: "0.4rem", color: "var(--color-primary)",
  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
});
export const MetricLabel = styled("span", { minWidth: 0, fontSize: "0.75rem", color: "var(--color-muted)" });
export const MetricValue = styled("strong", {
  minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", fontSize: "1.25rem", lineHeight: 1.1,
});
export const MetricHint = styled("span", { fontSize: "0.6875rem", color: "var(--color-muted)" });

export const ReportGrid = styled("div", {
  display: "grid", gap: "1rem", "@lg": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
});
export const Section = styled("section", {
  minWidth: 0, display: "grid", alignContent: "start", gap: "1rem",
  border: "1px solid var(--color-border)", borderRadius: "0.5rem",
  background: "var(--color-surface)", padding: "1rem",
});
export const FullSection = styled(Section, { "@lg": { gridColumn: "1 / -1" } });
export const SectionHeader = styled("header", {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
});
export const SectionTitle = styled("h2", { fontSize: "1rem", fontWeight: 700 });
export const SectionSubtitle = styled("p", { marginTop: "0.15rem", fontSize: "0.75rem", color: "var(--color-muted)" });

export const BarViewport = styled("div", { overflowX: "auto", paddingBottom: "0.25rem" });
export const BarChart = styled("div", {
  minHeight: "15rem", display: "grid", alignItems: "end", gap: "0.45rem",
  borderBottom: "1px solid var(--color-border)", padding: "2rem 0.25rem 0",
});
export const BarColumn = styled("div", {
  height: "12rem", minWidth: "2.25rem", display: "grid", gridTemplateRows: "1fr auto", alignItems: "end", gap: "0.45rem",
});
export const BarArea = styled("div", { height: "100%", display: "flex", alignItems: "end", position: "relative" });
export const Bar = styled("div", {
  width: "100%", minHeight: "0.2rem", borderRadius: "0.35rem 0.35rem 0 0",
  background: "var(--color-primary)", transition: "height 180ms ease",
});
export const BarValue = styled("span", {
  position: "absolute", left: "50%", bottom: "calc(var(--bar-height, 0%) + 0.25rem)",
  transform: "translateX(-50%)", maxWidth: "5rem", whiteSpace: "nowrap",
  fontSize: "0.625rem", fontWeight: 700, color: "var(--color-text)",
});
export const BarLabel = styled("span", {
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center",
  fontSize: "0.625rem", color: "var(--color-muted)",
});
export const Empty = styled("div", {
  minHeight: "10rem", display: "grid", placeItems: "center", textAlign: "center",
  color: "var(--color-muted)", fontSize: "0.875rem",
});

export const StatusList = styled("div", { display: "grid", gap: "0.75rem" });
export const StatusRow = styled("div", {
  display: "grid", gridTemplateColumns: "minmax(6.5rem, 0.8fr) minmax(8rem, 2fr) auto",
  alignItems: "center", gap: "0.65rem",
});
export const StatusLabel = styled("span", {
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem",
});
export const StatusTrack = styled("div", {
  height: "0.6rem", overflow: "hidden", borderRadius: "999px", background: "var(--color-background)",
});
export const StatusFill = styled("div", {
  height: "100%", minWidth: "0.2rem", borderRadius: "inherit", background: "var(--color-primary)",
});
export const StatusValue = styled("strong", { minWidth: "4.5rem", textAlign: "right", fontSize: "0.75rem" });

export const ToggleGroup = styled("div", {
  display: "inline-flex", padding: "0.2rem", borderRadius: "0.4rem", background: "var(--color-background)",
});
export const ToggleButton = styled("button", {
  border: 0, borderRadius: "0.3rem", background: "transparent", padding: "0.45rem 0.75rem",
  color: "var(--color-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
  variants: { active: { true: {
    background: "var(--color-surface)", color: "var(--color-text)", boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
  } } },
});

export const TableViewport = styled("div", { overflowX: "auto" });
export const Table = styled("table", {
  width: "100%", minWidth: "44rem", borderCollapse: "collapse", fontSize: "0.75rem",
  "th, td": { padding: "0.65rem 0.5rem", borderBottom: "1px solid var(--color-border)", textAlign: "right", whiteSpace: "nowrap" },
  "th": { color: "var(--color-muted)", fontWeight: 600 },
  "th:first-child, td:first-child, th:nth-child(2), td:nth-child(2)": { textAlign: "left" },
  "tbody tr:last-child td": { borderBottom: 0 },
});
export const Participation = styled("div", { minWidth: "6rem", display: "grid", gap: "0.25rem" });
export const ParticipationTrack = styled("span", {
  display: "block", width: "100%", height: "0.3rem", borderRadius: "999px",
  background: "var(--color-background)", overflow: "hidden",
});
export const ParticipationFill = styled("span", {
  display: "block", height: "100%", borderRadius: "inherit", background: "var(--color-primary)",
});

export const HeatmapViewport = styled("div", { overflowX: "auto" });
export const HeatmapGrid = styled("div", {
  minWidth: "54rem", display: "grid", gridTemplateColumns: "4rem repeat(24, minmax(1.8rem, 1fr))",
  gap: "0.2rem", alignItems: "center",
});
export const HeatmapLabel = styled("span", {
  padding: "0.25rem", textAlign: "center", fontSize: "0.625rem", color: "var(--color-muted)",
});
export const HeatmapDay = styled(HeatmapLabel, { textAlign: "left", fontWeight: 700, color: "var(--color-text)" });
export const HeatmapCell = styled("span", {
  minHeight: "1.8rem", display: "grid", placeItems: "center", borderRadius: "0.25rem",
  fontSize: "0.625rem", fontWeight: 700,
  variants: { level: {
    none: { background: "var(--color-background)", color: "var(--color-muted)" },
    low: { background: "#dcfce7", color: "#166534" },
    medium: { background: "#fef3c7", color: "#92400e" },
    high: { background: "#fee2e2", color: "#991b1b" },
  } },
});
export const Legend = styled("div", { display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.6875rem", color: "var(--color-muted)" });
export const LegendItem = styled("span", { display: "inline-flex", alignItems: "center", gap: "0.35rem" });
export const LegendColor = styled("span", {
  width: "0.75rem", height: "0.75rem", borderRadius: "0.2rem",
  variants: { level: {
    low: { background: "#dcfce7" }, medium: { background: "#fef3c7" }, high: { background: "#fee2e2" },
  } },
});

export const PaymentList = styled("div", { display: "grid", gap: "0.85rem" });
export const PaymentRow = styled("div", { display: "grid", gap: "0.35rem" });
export const PaymentHeader = styled("div", {
  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.75rem",
});
export const PaymentMeta = styled("span", { color: "var(--color-muted)", textAlign: "right" });
export const PaymentTrack = styled("div", {
  height: "0.7rem", overflow: "hidden", borderRadius: "999px", background: "var(--color-background)",
});
export const PaymentFill = styled("div", { height: "100%", borderRadius: "inherit", background: "var(--color-primary)" });

export const CalendarGrid = styled("div", {
  display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.35rem",
});
export const CalendarWeekday = styled("span", {
  paddingBottom: "0.25rem", textAlign: "center", fontSize: "0.625rem", fontWeight: 700, color: "var(--color-muted)",
});
export const CalendarSpacer = styled("span", { minHeight: "4.6rem" });
export const CalendarDay = styled("div", {
  minWidth: 0, minHeight: "4.6rem", display: "grid", alignContent: "space-between", gap: "0.25rem",
  border: "1px solid var(--color-border)", borderRadius: "0.35rem", padding: "0.45rem",
  variants: { tone: {
    neutral: {},
    best: { borderColor: "#16a34a", background: "#dcfce7", color: "#14532d" },
    worst: { borderColor: "#dc2626", background: "#fee2e2", color: "#7f1d1d" },
  } },
});
export const CalendarDate = styled("strong", { fontSize: "0.75rem" });
export const CalendarValue = styled("strong", { overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.7rem" });
export const CalendarOrders = styled("span", { fontSize: "0.6rem", color: "var(--color-muted)" });

export const Feedback = styled("div", {
  minHeight: "12rem", display: "grid", placeItems: "center", gap: "0.75rem", textAlign: "center",
  border: "1px solid var(--color-border)", borderRadius: "0.5rem", background: "var(--color-surface)",
  padding: "2rem", color: "var(--color-muted)",
});

export const LinksGrid = styled("section", {
  display: "grid", gap: "0.75rem",
  "@sm": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  "@lg": { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
});
export const LinkCard = styled("a", {
  display: "flex", alignItems: "center", gap: "0.75rem", borderRadius: "0.375rem",
  border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "0.875rem", fontWeight: 600,
  "&:hover": { borderColor: "var(--color-primary)" },
});
export const LinkIcon = styled("span", { color: "var(--color-primary)" });
