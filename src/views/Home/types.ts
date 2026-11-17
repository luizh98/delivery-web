import type { MenuResponse, RestaurantConfigResponse } from "@/types/api";
import type { PublicTableResponse } from "@/types/api";

export type CustomerMenuProps = {
  table?: PublicTableResponse & { token: string };
  restaurantConfig: RestaurantConfigResponse | null;
  menu: MenuResponse;
};
