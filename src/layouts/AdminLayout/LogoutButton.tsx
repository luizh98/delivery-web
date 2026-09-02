"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type LogoutButtonProps = {
  iconOnly?: boolean;
};

export function LogoutButton({ iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={iconOnly ? "Sair" : undefined}
      title={iconOnly ? "Sair" : undefined}
      onClick={logout}
    >
      <LogOut aria-hidden="true" size={iconOnly ? 18 : 16} />
      {iconOnly ? null : "Sair"}
    </Button>
  );
}
