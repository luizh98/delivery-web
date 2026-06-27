import type { MenuResponse, RestaurantConfigResponse } from "@/types/api";

export type CustomerMenuProps = {
  restaurantConfig: RestaurantConfigResponse | null;
  menu: MenuResponse;
};
