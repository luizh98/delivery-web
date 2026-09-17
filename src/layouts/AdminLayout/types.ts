import type { ReactNode } from "react";
import type { CurrentUserResponse } from "@/types/api";

export type AdminLayoutProps = {
  admin: CurrentUserResponse;
  restaurantName: string;
  storeOpen: boolean;
  children: ReactNode;
};
