"use client";

import type { ThemeProviderProps, ThemeVars } from "./types";
import { ProviderRoot } from "./styles";

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style: ThemeVars = {
    "--tenant-primary": theme?.primaryColor || "#0f766e",
    "--tenant-secondary": theme?.secondaryColor || "#f59e0b",
  };

  return (
    <ProviderRoot style={style}>
      {children}
    </ProviderRoot>
  );
}
