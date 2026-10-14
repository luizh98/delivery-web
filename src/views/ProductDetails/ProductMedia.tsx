"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/api";
import { MediaImage, MediaVideo, MediaFrame, MediaNotice } from "./styles";

export function ProductMedia({ product, playing = true, expanded = false }: { product: Product; playing?: boolean; expanded?: boolean }) {
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const video = useRef<HTMLVideoElement>(null);

  const togglePlayback = (element: HTMLVideoElement) => {
    element.muted = true;
    if (element.paused) void element.play().catch(() => undefined);
    else element.pause();
  };

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
        <MediaVideo
          ref={video} src={product.videoUrl} poster={product.imageUrl}
          muted loop playsInline disablePictureInPicture disableRemotePlayback preload="metadata"
          role="button" tabIndex={0} aria-pressed={!paused}
          aria-label={`${paused ? "Reproduzir" : "Pausar"} vídeo de ${product.name}`}
          onPlay={() => setPaused(false)} onPause={() => setPaused(true)}
          onClick={(event) => togglePlayback(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              if (!event.repeat) togglePlayback(event.currentTarget);
            }
          }}
        />
      ) : product.imageUrl ? (
        <MediaImage src={product.imageUrl} alt={`Foto de ${product.name}`} />
      ) : <MediaNotice>Produto sem foto</MediaNotice>}
      {failed ? <MediaNotice role="status">Vídeo indisponível. Exibindo foto do produto.</MediaNotice> : null}
    </MediaFrame>
  );
}
