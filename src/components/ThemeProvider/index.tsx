"use client";

import type { ThemeProviderProps, ThemeVars } from "./types";

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style: ThemeVars = {
    "--tenant-primary": theme?.primaryColor || "#0f766e",
    "--tenant-secondary": theme?.secondaryColor || "#f59e0b",
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={style}>
      {children}
    </div>
  );
}
