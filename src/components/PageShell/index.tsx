import type { PageShellProps } from "./types";
import { Shell } from "./styles";

export function PageShell({ children, className = "", bottomPad }: PageShellProps) {
  return (
    <Shell className={className} bottomPad={bottomPad}>
      {children}
    </Shell>
  );
}
