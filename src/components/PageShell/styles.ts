import { styled } from "styles";

export const Shell = styled("main", {
  width: "100%",
  maxWidth: "72rem",
  minHeight: "100vh",
  margin: "0 auto",
  padding: "1rem",

  "&:has(> [data-table-manager])": {
    minHeight: 0,
    height: "calc(100dvh - 4rem)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflow: "hidden",
  },

  "@sm": {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
  },

  variants: {
    bottomPad: {
      true: {
        paddingBottom: "7rem",
      },
    },
    flushTop: {
      true: {
        paddingTop: 0,
      },
    },
  },
});
