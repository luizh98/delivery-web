"use client";

import { Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { money } from "@/utils/format";
import {
  CarouselCard,
  CarouselDescription,
  CarouselHeader,
  CarouselHeading,
  CarouselImage,
  CarouselInfo,
  CarouselName,
  CarouselPrice,
  CarouselSection,
  CarouselTitle,
  CarouselTrack,
} from "./MostOrderedCarousel.styles";

const ADVANCE_INTERVAL_MS = 7_000;

export function MostOrderedCarousel({ products }: { products: Product[] }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startLeft: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = (index + products.length) % products.length;
    const slide = track.children[nextIndex] as HTMLElement | undefined;
    if (!slide) return;

    setActiveIndex(nextIndex);
    track.scrollTo({
      left: slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [products.length, reducedMotion]);

  useEffect(() => {
    if (products.length < 2 || interacting || reducedMotion) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(activeIndex + 1);
    }, ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, interacting, products.length, reducedMotion]);

  function closestIndex(track: HTMLDivElement) {
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (!first || !second) return 0;

    const step = second.offsetLeft - first.offsetLeft;
    if (step <= 0) return 0;
    return Math.max(0, Math.min(products.length - 1, Math.round(track.scrollLeft / step)));
  }

  function updateActiveIndex() {
    const track = trackRef.current;
    if (!track?.clientWidth) return;

    setActiveIndex(closestIndex(track));
  }

  function finishDrag(track: HTMLDivElement) {
    const drag = dragRef.current;
    if (!drag) return;

    dragRef.current = null;
    if (!drag.moved) return;

    track.style.scrollSnapType = "";
    suppressClickRef.current = true;
    goTo(closestIndex(track));
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  if (products.length === 0) return null;

  return (
    <CarouselSection
      aria-label="Mais pedidos"
      aria-roledescription="carrossel"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onPointerDown={() => setInteracting(true)}
      onPointerUp={() => setInteracting(false)}
      onPointerCancel={() => setInteracting(false)}
    >
      <CarouselHeader>
        <CarouselHeading>
          <Flame size={22} aria-hidden="true" />
          <CarouselTitle>Mais pedidos</CarouselTitle>
        </CarouselHeading>
      </CarouselHeader>
      <CarouselTrack
        ref={trackRef}
        onScroll={updateActiveIndex}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startLeft: event.currentTarget.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const distance = drag.startX - event.clientX;
          if (!drag.moved && Math.abs(distance) < 6) return;
          if (!drag.moved) {
            drag.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.style.scrollSnapType = "none";
          }
          event.currentTarget.scrollLeft = drag.startLeft + distance;
        }}
        onPointerUp={(event) => finishDrag(event.currentTarget)}
        onPointerCancel={(event) => finishDrag(event.currentTarget)}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
      >
        {products.map((product) => (
          <CarouselCard
            key={product.id}
            type="button"
            onClick={() => router.push(`/products/${encodeURIComponent(product.id)}`)}
          >
            <CarouselImage
              style={{
                backgroundImage: product.imageUrl
                  ? `url(${product.imageUrl})`
                  : "linear-gradient(135deg, var(--color-surface-muted), var(--color-border))",
              }}
            />
            <CarouselInfo>
              <CarouselName>{product.name}</CarouselName>
              {product.description ? <CarouselDescription>{product.description}</CarouselDescription> : null}
              <CarouselPrice>{money(product.priceCents)}</CarouselPrice>
            </CarouselInfo>
          </CarouselCard>
        ))}
      </CarouselTrack>
    </CarouselSection>
  );
}
