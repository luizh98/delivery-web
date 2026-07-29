"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Clock3, ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { PageShell } from "@/components/PageShell";
import { money } from "@/utils/format";
import { activeProductFlags } from "@/utils/productFlags";
import type { CustomerMenuProps } from "./types";
import type { BusinessHour, Product } from "@/types/api";
import {
  CategoryBar,
  CategoryButton,
  CategoryList,
  CategoryProducts,
  CategorySection,
  CategoryTitle,
  ContentGrid,
  Empty,
  Eyebrow,
  FlagBadge,
  FlagBadges,
  Hero,
  HeroBanner,
  HeroBody,
  HeroInfoGrid,
  HeroInfoItem,
  HeroText,
  HeroTitle,
  MobileCart,
  MobileSummary,
  MobileSummaryLabel,
  MobileTotal,
  ProductCard,
  ProductDescription,
  ProductImage,
  ProductInfo,
  ProductList,
  ProductName,
  ProductPrice,
} from "./styles";

const PRODUCT_DESCRIPTION_MAX_LENGTH = 120;
const PRODUCT_FOCUS_STORAGE_KEY = "delivery:return-focus-product-id";
const WEEK_DAY_VALUES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function subscribeToCurrentDay() {
  return () => {};
}

function getCurrentDay() {
  return WEEK_DAY_VALUES[new Date().getDay()];
}

function getServerDay() {
  return null;
}

function summarizeProductDescription(description?: string) {
  const text = description?.trim() || "Sem descricao.";

  if (text.length <= PRODUCT_DESCRIPTION_MAX_LENGTH) {
    return text;
  }

  const excerpt = text.slice(0, PRODUCT_DESCRIPTION_MAX_LENGTH - 3);
  const lastSpace = excerpt.lastIndexOf(" ");
  const truncated = lastSpace > 0 ? excerpt.slice(0, lastSpace) : excerpt;

  return `${truncated.trimEnd()}...`;
}

function formatTodayBusinessHours(
  hours: BusinessHour[] = [],
  dayOfWeek: string | null,
) {
  if (!dayOfWeek || hours.length === 0) {
    return null;
  }

  const hour = hours.find((item) => item.dayOfWeek === dayOfWeek);

  if (!hour || hour.closed) {
    return "Fechado";
  }

  return hour.openTime && hour.closeTime
    ? `${hour.openTime.slice(0, 5)} - ${hour.closeTime.slice(0, 5)}`
    : "Horario nao informado";
}

export function CustomerMenu({ restaurantConfig, menu }: CustomerMenuProps) {
  const router = useRouter();
  const { items: cart, subtotalCents } = useCart();
  const initialCategoryId =
    menu.categories.find((category) =>
      menu.products.some((product) => product.categoryId === category.id),
    )?.id ?? "";
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const currentDay = useSyncExternalStore<string | null>(
    subscribeToCurrentDay,
    getCurrentDay,
    getServerDay,
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const productRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const todayBusinessHours = formatTodayBusinessHours(
    restaurantConfig?.businessHours,
    currentDay,
  );
  const minimumOrderCents = restaurantConfig?.minimumOrderCents ?? 0;

  const productsByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();

    menu.categories.forEach((category) => groups.set(category.id, []));
    menu.products.forEach((product) => {
      groups.get(product.categoryId)?.push(product);
    });

    return groups;
  }, [menu.categories, menu.products]);

  const visibleCategories = useMemo(
    () =>
      menu.categories.filter(
        (category) => (productsByCategory.get(category.id)?.length ?? 0) > 0,
      ),
    [menu.categories, productsByCategory],
  );

  useEffect(() => {
    const productId = sessionStorage.getItem(PRODUCT_FOCUS_STORAGE_KEY);

    if (!productId) {
      return;
    }

    sessionStorage.removeItem(PRODUCT_FOCUS_STORAGE_KEY);

    const productCard = productRefs.current[productId];

    productCard?.focus({ preventScroll: true });
    productCard?.scrollIntoView({ block: "center" });
  }, []);

  function handleCategoryClick(categoryId: string) {
    setActiveCategoryId(categoryId);
    const section = sectionRefs.current[categoryId];

    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Hero>
        <HeroBanner
          style={{
            backgroundImage: restaurantConfig?.bannerUrl
              ? `url(${restaurantConfig.bannerUrl})`
              : "linear-gradient(135deg, var(--tenant-primary), var(--tenant-secondary))",
          }}
        />
        <HeroBody>
          <Eyebrow>Cardapio</Eyebrow>
          <HeroTitle>
            {restaurantConfig?.name ?? "Delivery"}
          </HeroTitle>
          <HeroText>
            {restaurantConfig?.menuDescription?.trim() ||
              "Escolha seus itens, revise o carrinho e envie o pedido."}
          </HeroText>
          {todayBusinessHours || minimumOrderCents > 0 ? (
            <HeroInfoGrid>
              {todayBusinessHours ? (
                <HeroInfoItem>
                  <Clock3 size={14} />
                  <span>Hoje:</span>
                  <strong>{todayBusinessHours}</strong>
                </HeroInfoItem>
              ) : null}
              {minimumOrderCents > 0 ? (
                <HeroInfoItem>
                  <ShoppingBag size={14} />
                  <span>Pedido minimo:</span>
                  <strong>{money(minimumOrderCents)}</strong>
                </HeroInfoItem>
              ) : null}
            </HeroInfoGrid>
          ) : null}
        </HeroBody>
      </Hero>

      <PageShell bottomPad>
      {visibleCategories.length > 0 ? (
        <CategoryBar>
          <CategoryList>
            {visibleCategories.map((category) => (
              <CategoryButton
                key={category.id}
                active={activeCategoryId === category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </CategoryButton>
            ))}
          </CategoryList>
        </CategoryBar>
      ) : null}

      <ContentGrid>
        <ProductList>
          {visibleCategories.length === 0 ? (
            <Empty>
              Nenhum produto cadastrado para este tenant.
            </Empty>
          ) : null}

          {visibleCategories.map((category) => (
            <CategorySection
              key={category.id}
              ref={(element: HTMLElement | null) => {
                sectionRefs.current[category.id] = element;
              }}
              tabIndex={-1}
              aria-labelledby={`category-${category.id}`}
            >
              <CategoryTitle id={`category-${category.id}`}>
                {category.name}
              </CategoryTitle>
              <CategoryProducts>
                {(productsByCategory.get(category.id) ?? []).map((product) => {
                  const flags = activeProductFlags(product);

                  return (
                    <ProductCard
                      key={product.id}
                      ref={(element: HTMLButtonElement | null) => {
                        productRefs.current[product.id] = element;
                      }}
                      onClick={() =>
                        router.push(
                          `/products/${encodeURIComponent(product.id)}`,
                        )
                      }
                    >
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductDescription>
                          {summarizeProductDescription(product.description)}
                        </ProductDescription>
                        {flags.length > 0 ? (
                          <FlagBadges>
                            {flags.map((flag) => (
                              <FlagBadge
                                key={flag.field}
                                tone={flag.tone}
                              >
                                {flag.label}
                              </FlagBadge>
                            ))}
                          </FlagBadges>
                        ) : null}
                        <ProductPrice>
                          {money(product.priceCents)}
                        </ProductPrice>
                      </ProductInfo>
                      <ProductImage
                        style={{
                          backgroundImage: product.imageUrl
                            ? `url(${product.imageUrl})`
                            : "linear-gradient(135deg, #edf2f7, #dbe4ee)",
                        }}
                      />
                    </ProductCard>
                  );
                })}
              </CategoryProducts>
            </CategorySection>
          ))}
        </ProductList>

      </ContentGrid>

      <MobileCart>
        <MobileSummary
          type="button"
          onClick={() => router.push("/cart")}
          aria-label="Abrir pagina do carrinho"
        >
          <MobileSummaryLabel>
            <ShoppingCart size={18} />
            Carrinho ({cart.length})
          </MobileSummaryLabel>
          <MobileTotal>{money(subtotalCents)}</MobileTotal>
        </MobileSummary>
      </MobileCart>
      </PageShell>
    </>
  );
}
