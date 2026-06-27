import type { ReactNode } from "react";
import type { CurrentUserResponse } from "@/types/api";

export type AdminLayoutProps = {
  admin: CurrentUserResponse;
  children: ReactNode;
};
