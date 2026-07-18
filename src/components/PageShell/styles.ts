import { styled } from "styles";

export const Shell = styled("main", {
  width: "100%",
  maxWidth: "72rem",
  minHeight: "100vh",
  margin: "0 auto",
  padding: "1rem",

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
  },
});
