"use client";

import { ChevronLeft, ChevronRight, Flame, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { money } from "@/utils/format";
import {
  CarouselCard,
  CarouselControl,
  CarouselControls,
  CarouselCount,
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
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
    if (products.length < 2 || paused || interacting || reducedMotion) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(activeIndex + 1);
    }, ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, goTo, interacting, paused, products.length, reducedMotion]);

  function updateActiveIndex() {
    const track = trackRef.current;
    if (!track?.clientWidth) return;

    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.max(0, Math.min(products.length - 1, index)));
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
        {products.length > 1 ? (
          <CarouselControls>
            <CarouselControl type="button" aria-label="Item anterior" onClick={() => goTo(activeIndex - 1)}>
              <ChevronLeft size={18} aria-hidden="true" />
            </CarouselControl>
            <CarouselCount aria-label={`Item ${activeIndex + 1} de ${products.length}`}>
              {activeIndex + 1}/{products.length}
            </CarouselCount>
            <CarouselControl type="button" aria-label="Próximo item" onClick={() => goTo(activeIndex + 1)}>
              <ChevronRight size={18} aria-hidden="true" />
            </CarouselControl>
            {!reducedMotion ? (
              <CarouselControl
                type="button"
                aria-label={paused ? "Retomar carrossel" : "Pausar carrossel"}
                aria-pressed={paused}
                onClick={() => setPaused((current) => !current)}
              >
                {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </CarouselControl>
            ) : null}
          </CarouselControls>
        ) : null}
      </CarouselHeader>
      <CarouselTrack
        ref={trackRef}
        onScroll={updateActiveIndex}
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
