import type { PageShellProps } from "./types";

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6 ${className}`}>
      {children}
    </main>
  );
}
