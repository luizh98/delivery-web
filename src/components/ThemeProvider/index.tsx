"use client";

import type { ThemeProviderProps, ThemeVars } from "./types";
import styles from "./styles.module.css";

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style: ThemeVars = {
    "--tenant-primary": theme?.primaryColor || "#0f766e",
    "--tenant-secondary": theme?.secondaryColor || "#f59e0b",
  };

  return (
    <div className={styles.provider} style={style}>
      {children}
    </div>
  );
}
