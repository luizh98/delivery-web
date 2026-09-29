"use client";

import { Flame } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
const SCROLL_SETTLE_MS = 150;

function slidesIn(track: HTMLDivElement) {
  return Array.from(track.querySelectorAll<HTMLButtonElement>(":scope > button[data-carousel-slide]"));
}

function slideLeft(track: HTMLDivElement, slide: HTMLElement) {
  return slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

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
  const pointerActiveRef = useRef(false);
  const slideIndexRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const productIds = products.map((product) => product.id).join("\0");
  const carouselProducts = products.length > 1
    ? [products[products.length - 1], ...products, products[0]]
    : products;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const jumpTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = slidesIn(track)[index];
    if (!slide) return;

    track.style.scrollSnapType = "none";
    track.scrollLeft = slideLeft(track, slide);
    slideIndexRef.current = index;
    requestAnimationFrame(() => {
      track.style.scrollSnapType = "";
    });
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) return;
    jumpTo(products.length > 1 ? 1 : 0);
    setReady(true);
  }, [jumpTo, productIds, products.length]);

  useEffect(() => () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = slidesIn(track)[index];
    if (!slide) return;

    slideIndexRef.current = index;
    track.scrollTo({
      left: slideLeft(track, slide),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [reducedMotion]);

  useEffect(() => {
    if (!ready || products.length < 2 || interacting || reducedMotion) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(slideIndexRef.current + 1);
    }, ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [goTo, interacting, products.length, ready, reducedMotion]);

  function closestIndex(track: HTMLDivElement) {
    const slides = slidesIn(track);
    if (slides.length < 2) return 0;
    const firstLeft = slideLeft(track, slides[0]);
    const step = slideLeft(track, slides[1]) - firstLeft;
    if (step <= 0) return 0;
    return Math.max(0, Math.min(slides.length - 1, Math.round((track.scrollLeft - firstLeft) / step)));
  }

  function updateActiveIndex() {
    const track = trackRef.current;
    if (!track?.clientWidth) return;

    slideIndexRef.current = closestIndex(track);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      if (pointerActiveRef.current) return;
      const settledIndex = closestIndex(track);
      if (settledIndex === 0) jumpTo(products.length);
      if (settledIndex === products.length + 1) jumpTo(1);
    }, SCROLL_SETTLE_MS);
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
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
          setInteracting(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onPointerDown={() => {
        pointerActiveRef.current = true;
        setInteracting(true);
      }}
      onPointerUp={() => {
        pointerActiveRef.current = false;
        setInteracting(false);
        updateActiveIndex();
      }}
      onPointerCancel={() => {
        pointerActiveRef.current = false;
        setInteracting(false);
        updateActiveIndex();
      }}
    >
      <CarouselHeader>
        <CarouselHeading>
          <Flame size={22} aria-hidden="true" />
          <CarouselTitle>Mais pedidos</CarouselTitle>
        </CarouselHeading>
      </CarouselHeader>
      <CarouselTrack
        ref={trackRef}
        style={{ visibility: ready ? "visible" : "hidden" }}
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
        {carouselProducts.map((product, index) => (
          <CarouselCard
            key={`${product.id}-${index}`}
            data-carousel-slide=""
            aria-hidden={products.length > 1 && (index === 0 || index === carouselProducts.length - 1)}
            tabIndex={products.length > 1 && (index === 0 || index === carouselProducts.length - 1) ? -1 : 0}
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
