"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  ShoppingBag,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { PageShell } from "@/components/PageShell";
import {
  isValidBrazilianMobile,
  normalizeBrazilianMobile,
} from "@/utils/customerInput";
import { money } from "@/utils/format";
import { activeProductFlags } from "@/utils/productFlags";
import { formatClosedStoreMessage } from "@/utils/storeAvailability";
import type { CustomerMenuProps } from "./types";
import type { BusinessHour, Product } from "@/types/api";
import {
  CategoryBar,
  CategoryButton,
  CategoryList,
  CategoryProducts,
  CategorySection,
  CategoryTitle,
  ClosedStoreNotice,
  ContentGrid,
  Empty,
  FlagBadge,
  FlagBadges,
  Hero,
  HeroBanner,
  HeroBody,
  HeroDetailsRow,
  HeroInfoGrid,
  HeroInfoItem,
  HeroText,
  HeroTitle,
  HeroTitleRow,
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
  TrackingActions,
  TrackingShortcut,
  WhatsAppShortcut,
} from "./styles";

const PRODUCT_DESCRIPTION_MAX_LENGTH = 120;
const PRODUCT_FOCUS_STORAGE_KEY = "delivery:return-focus-product-id";
const CART_FEEDBACK_STORAGE_KEY = "delivery:show-cart-feedback";
const CART_FEEDBACK_CHANGE_EVENT = "delivery-cart-feedback-change";
const CART_FEEDBACK_DURATION_MS = 2_000;
const WEEK_DAY_VALUES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.148-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 7.021 2.91 9.825 9.825 0 0 1 2.9 7.026c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.14 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
      />
    </svg>
  );
}

function subscribeToCurrentDay() {
  return () => {};
}

function getCurrentDay() {
  return WEEK_DAY_VALUES[new Date().getDay()];
}

function getServerDay() {
  return null;
}

function subscribeToCartFeedback(onStoreChange: () => void) {
  window.addEventListener(CART_FEEDBACK_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(CART_FEEDBACK_CHANGE_EVENT, onStoreChange);
  };
}

function getCartFeedback() {
  return sessionStorage.getItem(CART_FEEDBACK_STORAGE_KEY) === "true";
}

function getServerCartFeedback() {
  return false;
}

function summarizeProductDescription(description?: string) {
  const text = description?.trim() || "Sem descrição.";

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
    : "Horário não informado";
}

export function CustomerMenu({ restaurantConfig, menu }: CustomerMenuProps) {
  const router = useRouter();
  const { items: cart, subtotalCents } = useCart();
  const { customer } = useCustomerAuth();
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
  const showCartFeedback = useSyncExternalStore(
    subscribeToCartFeedback,
    getCartFeedback,
    getServerCartFeedback,
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const productRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const todayBusinessHours = formatTodayBusinessHours(
    restaurantConfig?.businessHours,
    currentDay,
  );
  const minimumOrderCents = restaurantConfig?.minimumOrderCents ?? 0;
  const whatsapp = normalizeBrazilianMobile(restaurantConfig?.whatsapp ?? "");
  const whatsappHref = isValidBrazilianMobile(whatsapp)
    ? `https://wa.me/55${whatsapp}`
    : null;
  const closedStoreMessage =
    restaurantConfig?.open === false
      ? formatClosedStoreMessage(restaurantConfig.nextOpeningAt)
      : null;
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

    if (productId) {
      sessionStorage.removeItem(PRODUCT_FOCUS_STORAGE_KEY);

      const productCard = productRefs.current[productId];

      productCard?.focus({ preventScroll: true });
      productCard?.scrollIntoView({ block: "center" });
    }
  }, []);

  useEffect(() => {
    if (!showCartFeedback) {
      return;
    }

    const feedbackTimeout = window.setTimeout(
      () => {
        sessionStorage.removeItem(CART_FEEDBACK_STORAGE_KEY);
        window.dispatchEvent(new Event(CART_FEEDBACK_CHANGE_EVENT));
      },
      CART_FEEDBACK_DURATION_MS,
    );

    return () => window.clearTimeout(feedbackTimeout);
  }, [showCartFeedback]);

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
          <HeroTitleRow>
            <HeroTitle>{restaurantConfig?.name ?? "Delivery"}</HeroTitle>
            {whatsappHref ? (
              <WhatsAppShortcut
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Conversar com o estabelecimento pelo WhatsApp"
              >
                <WhatsAppIcon />
              </WhatsAppShortcut>
            ) : null}
          </HeroTitleRow>
          <HeroText>
            {restaurantConfig?.menuDescription?.trim() ||
              "Escolha seus itens, revise o pedido e envie."}
          </HeroText>
          <TrackingActions>
            <TrackingShortcut
              type="button"
              tone="secondary"
              onClick={() => router.push(customer ? "/account" : "/login")}
            >
              <UserRound size={16} aria-hidden="true" />
              {customer?.name.trim() || "Entrar ou criar conta"}
            </TrackingShortcut>
            <TrackingShortcut
              type="button"
              tone="secondary"
              onClick={() => router.push("/orders")}
            >
              <ClipboardList size={16} aria-hidden="true" />
              Meus pedidos
            </TrackingShortcut>
          </TrackingActions>
          {closedStoreMessage ||
          todayBusinessHours ||
          minimumOrderCents > 0 ? (
            <HeroDetailsRow>
              <HeroInfoGrid>
                {closedStoreMessage ? (
                  <ClosedStoreNotice role="status">
                    <Clock3 size={14} />
                    {closedStoreMessage}
                  </ClosedStoreNotice>
                ) : todayBusinessHours ? (
                  <HeroInfoItem>
                    <Clock3 size={14} />
                    <span>Hoje:</span>
                    <strong>{todayBusinessHours}</strong>
                  </HeroInfoItem>
                ) : null}
                {minimumOrderCents > 0 ? (
                  <HeroInfoItem>
                    <ShoppingBag size={14} />
                    <span>Pedido mínimo:</span>
                    <strong>{money(minimumOrderCents)}</strong>
                  </HeroInfoItem>
                ) : null}
              </HeroInfoGrid>
            </HeroDetailsRow>
          ) : null}
        </HeroBody>
      </Hero>

      <PageShell bottomPad flushTop>
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
          aria-label={
            showCartFeedback
              ? "Item adicionado ao pedido. Abrir página do pedido"
              : "Abrir página do pedido"
          }
          aria-live="polite"
          feedback={showCartFeedback}
        >
          {showCartFeedback ? (
            <MobileSummaryLabel>
              <Check size={18} />
              Item adicionado ao pedido
            </MobileSummaryLabel>
          ) : (
            <>
              <MobileSummaryLabel>
                <ShoppingCart size={18} />
                Ver pedido ({cart.length})
                <ChevronRight size={18} aria-hidden="true" />
              </MobileSummaryLabel>
              <MobileTotal>{money(subtotalCents)}</MobileTotal>
            </>
          )}
        </MobileSummary>
      </MobileCart>
      </PageShell>
    </>
  );
}
