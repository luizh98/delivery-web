import type { MenuResponse, RestaurantConfigResponse } from "@/types/api";

export type CustomerMenuProps = {
  table?: { number: string; token: string };
  restaurantConfig: RestaurantConfigResponse | null;
  menu: MenuResponse;
};
