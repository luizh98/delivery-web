import { styled } from "styles";

export const Root = styled("div", {
  display: "grid",
  gap: "1rem",
});

export const PanelRoot = styled("section", {
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

export const DetailsCard = styled("details", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "1rem",

  "&[open] > summary [data-details-icon]": {
    transform: "rotate(180deg)",
  },
});

export const DetailsSummary = styled("summary", {
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  fontSize: "1rem",
  fontWeight: 700,
});

export const SummaryTitle = styled("span", {
  minWidth: 0,
});

export const SummaryMeta = styled("span", {
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-muted)",
});

export const SummaryMetaPlain = styled("span", {
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const DetailsIcon = styled("span", {
  flexShrink: 0,
  color: "var(--color-muted)",
  transition: "transform 200ms ease",

  "@motion-reduce": {
    transition: "none",
  },
});

export const DetailsBody = styled("div", {
  paddingTop: "1rem",
});

export const ProductForm = styled("form", {
  display: "grid",
  gap: "0.75rem",
  paddingTop: "1rem",
});

export const SectionHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const BuilderHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const ItemHeader = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

export const FormTitle = styled("h2", {
  fontSize: "1.125rem",
  fontWeight: 700,
});

export const BuilderTitle = styled("h2", {
  fontSize: "1rem",
  fontWeight: 700,
});

export const SectionTitle = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const ItemTitle = styled("p", {
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const CardTitle = styled("p", {
  fontWeight: 600,
});

export const Description = styled("p", {
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const Muted = styled("p", {
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const GridTwo = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

const checkboxBase = {
  display: "flex",
  height: "2.75rem",
  alignItems: "center",
  alignSelf: "end",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  fontWeight: 500,

  input: {
    accentColor: "var(--color-primary)",
  },
};

export const CheckboxBackground = styled("label", {
  ...checkboxBase,
  background: "var(--color-background)",
});

export const CheckboxSurface = styled("label", {
  ...checkboxBase,
  background: "var(--color-surface)",
});

export const FlagFieldset = styled("fieldset", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const FlagLegend = styled("legend", {
  padding: "0 0.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const FlagGrid = styled("div", {
  display: "grid",
  gap: "0.5rem",

  "@sm": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },

  "@lg": {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
});

export const FlagBadges = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
  marginTop: "0.5rem",
});

export const FlagBadge = styled("span", {
  display: "inline-flex",
  height: "18px",
  alignItems: "center",
  borderRadius: "3px",
  border: "1px solid",
  padding: "0 0.375rem",
  fontSize: "10px",
  fontWeight: 600,
  lineHeight: 1,

  variants: {
    tone: {
      adult: {
        borderColor: "#171717",
        background: "#0a0a0a",
        color: "#ffffff",
      },
      gluten: {
        borderColor: "#fde68a",
        background: "#fffbeb",
        color: "#451a03",
      },
      lactose: {
        borderColor: "#bae6fd",
        background: "#f0f9ff",
        color: "#0369a1",
      },
      vegetarian: {
        borderColor: "#a7f3d0",
        background: "#ecfdf5",
        color: "#047857",
      },
    },
  },
});

export const OptionsSection = styled("section", {
  display: "grid",
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  borderBottom: "1px solid var(--color-border)",
  padding: "0.75rem 0",
});

export const NestedDetails = styled("details", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",

  "&[open] > summary [data-details-icon]": {
    transform: "rotate(180deg)",
  },
});

export const NestedSummary = styled("summary", {
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const NestedBody = styled("div", {
  display: "grid",
  gap: "0.75rem",
  paddingTop: "0.75rem",
});

export const SearchLabel = styled("label", {
  display: "grid",
  gap: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
});

export const ProductSearchLabel = styled("label", {
  display: "grid",
  width: "100%",
  gap: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,

  "@md": {
    width: "min(100%, 38rem)",
  },
});

export const ProductCategoryFilterLabel = styled("label", {
  display: "grid",
  width: "100%",
  gap: "0.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,

  "@sm": {
    width: "14rem",
  },
});

export const SearchWrap = styled("span", {
  position: "relative",

  input: {
    width: "100%",
    paddingLeft: "2.25rem",
  },
});

export const SearchIcon = styled("span", {
  pointerEvents: "none",
  position: "absolute",
  left: "0.75rem",
  top: "50%",
  color: "var(--color-muted)",
  transform: "translateY(-50%)",
});

export const Empty = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const EmptySurface = styled("div", {
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const EmptyInfo = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px dashed var(--color-border)",
  background: "var(--color-background)",
  padding: "1rem",
  fontSize: "0.875rem",
  color: "var(--color-muted)",
});

export const ScrollList = styled("div", {
  display: "grid",
  maxHeight: "22rem",
  gap: "0.5rem",
  overflowY: "auto",
  paddingRight: "0.25rem",
});

export const GroupList = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const GroupCard = styled("section", {
  display: "grid",
  gap: "0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const GroupFields = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@md": {
    gridTemplateColumns: "1fr auto auto",
  },
});

export const ItemList = styled("div", {
  display: "grid",
  gap: "0.75rem",
});

export const ItemRow = styled("div", {
  display: "grid",
  gap: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
});

export const ItemFields = styled("div", {
  display: "grid",
  gap: "0.75rem",

  "@md": {
    gridTemplateColumns: "1fr 160px auto",
  },
});

export const IconActions = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
});

export const IconButton = styled("button", {
  borderRadius: "0.375rem",
  padding: "0.5rem",

  "&:hover": {
    background: "var(--color-surface-muted)",
  },

  "&:disabled": {
    opacity: 0.4,
  },
});

export const ErrorText = styled("p", {
  fontSize: "0.75rem",
  color: "#dc2626",
});

export const ErrorTextLarge = styled("p", {
  fontSize: "0.875rem",
  color: "#dc2626",
});

export const PaneGrid = styled("div", {
  display: "grid",
  gap: "1rem",

  "@lg": {
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
  },
});

export const Pane = styled("section", {
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
});

export const SummaryCard = styled("div", {
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const Actions = styled("div", {
  display: "flex",
  justifyContent: "flex-end",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
});

export const TemplateCard = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const AvailableTemplateCard = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.75rem",

  "@md": {
    gridTemplateColumns: "1fr auto",
  },
});

export const CardActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
});

export const SelectedGroups = styled("div", {
  display: "grid",
  gap: "0.5rem",
});

export const SelectedGroupCard = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-background)",
  padding: "0.75rem",
});

export const ProductSection = styled("section", {
  display: "grid",
  gap: "0.75rem",
});

export const ProductToolbar = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: "0.75rem",
});

export const ProductCount = styled("p", {
  flexShrink: 0,
  whiteSpace: "nowrap",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-muted)",
});

export const ProductList = styled("div", {
  display: "grid",
  maxHeight: "32rem",
  gap: "0.5rem",
  overflowY: "auto",
  paddingRight: "0.25rem",
});

export const ProductCard = styled("div", {
  display: "grid",
  gap: "0.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  padding: "0.75rem",

  "@sm": {
    gridTemplateColumns: "1fr auto",
  },
});

export const ProductMeta = styled("p", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--color-muted)",
});

export const ProductCategory = styled("p", {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-muted)",
});

export const StatusBadge = styled("span", {
  display: "inline-flex",
  height: "14px",
  alignItems: "center",
  borderRadius: "3px",
  border: "1px solid",
  padding: "0 0.25rem",
  fontSize: "10px",
  lineHeight: 1,

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

export const ProductActions = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
});

export const Price = styled("p", {
  fontWeight: 700,
  color: "var(--color-primary)",
});

export const OptionBuilder = styled("section", {
  display: "grid",
  gap: "0.75rem",
});
