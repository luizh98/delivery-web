import type { MenuResponse, RestaurantConfigResponse } from "@/types/api";

export type CustomerMenuProps = {
  table?: { number: string; token: string; kind?: "TABLE" | "COMMAND" };
  restaurantConfig: RestaurantConfigResponse | null;
  menu: MenuResponse;
};
