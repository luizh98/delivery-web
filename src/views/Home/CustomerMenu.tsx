"use client";

import { Armchair, ClipboardList, Clock3, ShoppingBag, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { isValidBrazilianMobile, normalizeBrazilianMobile } from "@/utils/customerInput";
import { money } from "@/utils/format";
import { tableLabel } from "@/utils/tableIdentity";
import { formatClosedStoreMessage } from "@/utils/storeAvailability";
import type { BusinessHour } from "@/types/api";
import type { CustomerMenuProps } from "./types";
import { MenuCatalog } from "./MenuCatalog";
import {
  ClosedStoreNotice, Hero, HeroBanner, HeroBody, HeroDetailsRow, HeroInfoGrid,
  HeroInfoItem, HeroText, HeroTitle, HeroTitleRow, MenuPanel, TableIdentity,
  TrackingActions, TrackingShortcut, WhatsAppShortcut,
} from "./styles";

const WEEK_DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const subscribeToDay = () => () => {};
const currentDay = () => WEEK_DAYS[new Date().getDay()];
const serverDay = () => null;

function todayHours(hours: BusinessHour[] | null | undefined, day: string | null) {
  if (!day || !hours?.length) return null;
  const hour = hours.find((item) => item.dayOfWeek === day);
  if (!hour || hour.closed) return "Fechado";
  return hour.openTime && hour.closeTime
    ? `${hour.openTime.slice(0, 5)} - ${hour.closeTime.slice(0, 5)}`
    : "Horário não informado";
}

export function CustomerMenu({ restaurantConfig, menu, table }: CustomerMenuProps) {
  const router = useRouter();
  const { customer } = useCustomerAuth();
  const day = useSyncExternalStore<string | null>(subscribeToDay, currentDay, serverDay);
  const hours = todayHours(restaurantConfig?.businessHours, day);
  const minimum = restaurantConfig?.minimumOrderCents ?? 0;
  const phone = normalizeBrazilianMobile(restaurantConfig?.whatsapp ?? "");
  const closed = restaurantConfig?.open === false
    ? formatClosedStoreMessage(restaurantConfig.nextOpeningAt) : null;

  return <>
    <HeroBanner style={{ backgroundImage: restaurantConfig?.bannerUrl
      ? `url(${restaurantConfig.bannerUrl})`
      : "linear-gradient(135deg, var(--tenant-primary), var(--tenant-secondary))" }} />
    <MenuPanel>
      <Hero><HeroBody>
        <HeroTitleRow>
          <HeroTitle>{restaurantConfig?.name ?? "Cardápio"}</HeroTitle>
          {isValidBrazilianMobile(phone) ? <WhatsAppShortcut href={`https://wa.me/55${phone}`} target="_blank" rel="noopener noreferrer" aria-label="Conversar com o estabelecimento pelo WhatsApp"><WhatsAppIcon /></WhatsAppShortcut> : null}
        </HeroTitleRow>
        <HeroText>{restaurantConfig?.menuDescription?.trim() || "Escolha seus itens, revise o pedido e envie."}</HeroText>
        <TrackingActions>
          {table ? <TableIdentity><Armchair size={18} aria-hidden="true" />{tableLabel(table)}</TableIdentity>
            : <TrackingShortcut type="button" tone="secondary" onClick={() => router.push(customer ? "/account" : "/login")}><UserRound size={16} aria-hidden="true" />{customer?.name.trim() || "Entrar ou criar conta"}</TrackingShortcut>}
          <TrackingShortcut type="button" tone="secondary" onClick={() => router.push(table ? `/menu/pedidos?mesa=${encodeURIComponent(table.token)}` : "/orders")}><ClipboardList size={16} aria-hidden="true" />{table ? "Comanda" : "Meus pedidos"}</TrackingShortcut>
        </TrackingActions>
        {!table && (closed || hours || minimum > 0) ? <HeroDetailsRow><HeroInfoGrid>
          {closed ? <ClosedStoreNotice role="status"><Clock3 size={14} />{closed}</ClosedStoreNotice>
            : hours ? <HeroInfoItem><Clock3 size={14} /><span>Hoje:</span><strong>{hours}</strong></HeroInfoItem> : null}
          {minimum > 0 ? <HeroInfoItem><ShoppingBag size={14} /><span>Pedido mínimo:</span><strong>{money(minimum)}</strong></HeroInfoItem> : null}
        </HeroInfoGrid></HeroDetailsRow> : null}
      </HeroBody></Hero>
      <MenuCatalog menu={menu} table={table} />
    </MenuPanel>
  </>;
}
