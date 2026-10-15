"use client";

import { Flame, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/api";
import { ProductPrice } from "@/components/ProductPrice";
import { VideoBadge } from "./styles";
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

export function MostOrderedCarousel({ products }: { products: Product[] }) {
  const router = useRouter();
  if (products.length === 0) return null;

  return (
    <CarouselSection aria-label="Mais pedidos">
      <CarouselHeader>
        <CarouselHeading>
          <Flame size={22} aria-hidden="true" />
          <CarouselTitle>Mais pedidos</CarouselTitle>
        </CarouselHeading>
      </CarouselHeader>
      <CarouselTrack>
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
            >
              {product.videoUrl && product.imageUrl ? <VideoBadge><Play size={12} aria-hidden="true" />Vídeo</VideoBadge> : null}
            </CarouselImage>
            <CarouselInfo>
              <CarouselName>{product.name}</CarouselName>
              {product.description ? <CarouselDescription>{product.description}</CarouselDescription> : null}
              <CarouselPrice><ProductPrice product={product} /></CarouselPrice>
            </CarouselInfo>
          </CarouselCard>
        ))}
      </CarouselTrack>
    </CarouselSection>
  );
}
