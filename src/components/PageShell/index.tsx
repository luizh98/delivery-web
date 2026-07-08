import { cx } from "@/utils/classNames";
import type { PageShellProps } from "./types";
import styles from "./styles.module.css";

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={cx(styles.shell, className)}>
      {children}
    </main>
  );
}
