import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/types/api";

export type ThemeVars = CSSProperties & {
  "--tenant-primary": string;
  "--tenant-secondary": string;
  "--color-primary": string;
  "--color-secondary": string;
};

export type ThemeProviderProps = {
  theme?: Theme | null;
  children: ReactNode;
};
