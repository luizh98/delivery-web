"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/api";
import { MediaImage, MediaVideo, MediaFrame, MediaNotice } from "./styles";

export function ProductMedia({ product, playing = true, expanded = false }: { product: Product; playing?: boolean; expanded?: boolean }) {
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let active = true;
    const checkError = () => { if (active && element.error) setFailed(true); };
    element.addEventListener("error", checkError);
    // A failed poster/video request can finish before React hydrates the server markup.
    queueMicrotask(checkError);
    if (playing && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void element.play().catch(() => undefined);
    } else {
      element.pause();
    }
    return () => {
      active = false;
      element.removeEventListener("error", checkError);
      element.pause();
    };
  }, [playing, product.videoUrl]);

  return (
    <MediaFrame expanded={expanded}>
      {product.videoUrl && product.imageUrl && !failed ? (
        <MediaVideo ref={video} src={product.videoUrl} poster={product.imageUrl} controls muted loop playsInline preload="metadata" aria-label={`Vídeo de ${product.name}`} />
      ) : product.imageUrl ? (
        <MediaImage src={product.imageUrl} alt={`Foto de ${product.name}`} />
      ) : <MediaNotice>Produto sem foto</MediaNotice>}
      {failed ? <MediaNotice role="status">Vídeo indisponível. Exibindo foto do produto.</MediaNotice> : null}
    </MediaFrame>
  );
}
