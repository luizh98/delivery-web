"use client";

import type { ThemeProviderProps, ThemeVars } from "./types";
import { ProviderRoot } from "./styles";
import { DEFAULT_THEME, themeForeground } from "@/utils/theme";

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const primaryColor = theme?.primaryColor || DEFAULT_THEME.primaryColor;
  const secondaryColor = theme?.secondaryColor || DEFAULT_THEME.secondaryColor;
  const style: ThemeVars = {
    "--tenant-primary": primaryColor,
    "--tenant-secondary": secondaryColor,
    "--color-primary": primaryColor,
    "--color-secondary": secondaryColor,
    "--color-primary-foreground": themeForeground(primaryColor),
    "--color-secondary-foreground": themeForeground(secondaryColor),
    "--color-primary-text": primaryColor.toLowerCase() === DEFAULT_THEME.primaryColor ? "#b83e05" : primaryColor,
  };

  return (
    <ProviderRoot style={style}>
      {children}
    </ProviderRoot>
  );
}
