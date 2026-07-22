"use client";

import type { ThemeProviderProps, ThemeVars } from "./types";
import { ProviderRoot } from "./styles";

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const primaryColor = theme?.primaryColor || "#0f766e";
  const secondaryColor = theme?.secondaryColor || "#f59e0b";
  const style: ThemeVars = {
    "--tenant-primary": primaryColor,
    "--tenant-secondary": secondaryColor,
    "--color-primary": primaryColor,
    "--color-secondary": secondaryColor,
  };

  return (
    <ProviderRoot style={style}>
      {children}
    </ProviderRoot>
  );
}
