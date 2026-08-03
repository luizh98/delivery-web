import type { PageShellProps } from "./types";
import { Shell } from "./styles";

export function PageShell({
  children,
  className = "",
  bottomPad,
  flushTop,
}: PageShellProps) {
  return (
    <Shell className={className} bottomPad={bottomPad} flushTop={flushTop}>
      {children}
    </Shell>
  );
}
