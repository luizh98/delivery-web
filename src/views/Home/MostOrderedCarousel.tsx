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

const SLIDE_DURATION_MS = 5_000;
const TOUCH_SETTLE_MS = 180;

function slidesIn(track: HTMLDivElement) {
  return Array.from(track.querySelectorAll<HTMLButtonElement>(":scope > button[data-carousel-slide]"));
}

function slideLeft(track: HTMLDivElement, slide: HTMLElement) {
  return slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

function slideStep(slides: HTMLButtonElement[]) {
  return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
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
  const stepRef = useRef(0);
  const positionRef = useRef(0);
  const loopStartRef = useRef(0);
  const loopSpanRef = useRef(0);
  const touchCoastingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const wheelUntilRef = useRef(0);
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

  const wrapScroll = useCallback((track: HTMLDivElement) => {
    const start = loopStartRef.current;
    const span = loopSpanRef.current;
    if (products.length < 2 || span <= 0) return 0;

    let next = track.scrollLeft;
    if (next < start) next += span;
    if (next >= start + span - 0.5) next = start + Math.max(0, next - start - span);
    const shift = next - track.scrollLeft;
    if (shift) track.scrollLeft = next;
    return shift;
  }, [products.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) return;
    const slides = slidesIn(track);
    if (products.length > 1) {
      stepRef.current = slideStep(slides);
      loopStartRef.current = slideLeft(track, slides[1]);
      loopSpanRef.current = slideLeft(track, slides[slides.length - 1]) - loopStartRef.current;
      track.scrollLeft = loopStartRef.current;
      positionRef.current = track.scrollLeft;
    }
    setReady(true);

    const observer = new ResizeObserver(() => {
      if (products.length < 2) return;
      const nextStep = slideStep(slides);
      const nextStart = slideLeft(track, slides[1]);
      const nextSpan = slideLeft(track, slides[slides.length - 1]) - nextStart;
      if (nextStep <= 0 || nextStep === stepRef.current) return;
      const progress = (positionRef.current - loopStartRef.current) / loopSpanRef.current;
      stepRef.current = nextStep;
      loopStartRef.current = nextStart;
      loopSpanRef.current = nextSpan;
      positionRef.current = nextStart + progress * nextSpan;
      track.scrollLeft = positionRef.current;
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [productIds, products.length]);

  useEffect(() => {
    if (!ready || products.length < 2 || interacting || reducedMotion) return;

    let frame: number;
    let previousTime: number | null = null;
    function advance(time: number) {
      frame = requestAnimationFrame(advance);
      const elapsed = previousTime === null ? 0 : time - previousTime;
      previousTime = time;
      if (document.hidden || pointerActiveRef.current || time < resumeAtRef.current) return;

      const track = trackRef.current;
      if (!track || stepRef.current <= 0) return;
      const start = loopStartRef.current;
      const span = loopSpanRef.current;
      positionRef.current = start + (positionRef.current - start + stepRef.current * elapsed / SLIDE_DURATION_MS) % span;
      track.scrollLeft = positionRef.current;
      if (time >= resumeAtRef.current) touchCoastingRef.current = false;
    }
    const resetClock = () => { previousTime = null; };
    document.addEventListener("visibilitychange", resetClock);
    frame = requestAnimationFrame(advance);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resetClock);
    };
  }, [interacting, products.length, ready, reducedMotion]);

  function finishDrag() {
    const drag = dragRef.current;
    if (!drag) return;

    dragRef.current = null;
    if (!drag.moved) return;

    suppressClickRef.current = true;
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
        touchCoastingRef.current = false;
        positionRef.current = trackRef.current?.scrollLeft ?? 0;
        setInteracting(true);
      }}
      onPointerUp={(event) => {
        pointerActiveRef.current = false;
        positionRef.current = trackRef.current?.scrollLeft ?? 0;
        if (event.pointerType === "touch") {
          touchCoastingRef.current = true;
          resumeAtRef.current = performance.now() + TOUCH_SETTLE_MS;
        }
        setInteracting(false);
      }}
      onPointerCancel={(event) => {
        pointerActiveRef.current = false;
        positionRef.current = trackRef.current?.scrollLeft ?? 0;
        if (event.pointerType === "touch") {
          touchCoastingRef.current = true;
          resumeAtRef.current = performance.now() + TOUCH_SETTLE_MS;
        }
        setInteracting(false);
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
        onScroll={(event) => {
          if (!pointerActiveRef.current && !touchCoastingRef.current && !interacting && performance.now() >= wheelUntilRef.current) return;
          const shift = wrapScroll(event.currentTarget);
          if (dragRef.current?.moved) dragRef.current.startLeft += shift;
          positionRef.current = event.currentTarget.scrollLeft;
          if (touchCoastingRef.current) resumeAtRef.current = performance.now() + TOUCH_SETTLE_MS;
        }}
        onWheel={() => {
          wheelUntilRef.current = performance.now() + TOUCH_SETTLE_MS;
          resumeAtRef.current = wheelUntilRef.current;
        }}
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
          }
          event.currentTarget.scrollLeft = drag.startLeft + distance;
          drag.startLeft += wrapScroll(event.currentTarget);
          positionRef.current = event.currentTarget.scrollLeft;
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
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
