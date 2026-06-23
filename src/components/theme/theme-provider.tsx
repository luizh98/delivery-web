"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/types/api";

type ThemeVars = CSSProperties & {
  "--tenant-primary": string;
  "--tenant-secondary": string;
};

type ThemeProviderProps = {
  theme?: Theme | null;
  children: ReactNode;
};

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
