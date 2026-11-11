"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChoiceList } from "./styles";

export function VisibleItemsList({
  children,
  count,
  label,
  offers = false,
}: {
  children: ReactNode;
  count: number;
  label: string;
  offers?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const items = Array.from(list.children)
      .filter((item) => item.getClientRects().length > 0)
      .slice(0, count);
    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      setHeight(items.reduce((sum, item) => sum + item.getBoundingClientRect().height, 0)
        + Math.max(0, items.length - 1) * gap);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    items.forEach((item) => observer.observe(item));
    measure();
    return () => observer.disconnect();
  }, [children, count]);

  return (
    <ChoiceList ref={ref} offers={offers} role="region" aria-label={label} tabIndex={0}
      style={{ maxHeight: height }}>
      {children}
    </ChoiceList>
  );
}
