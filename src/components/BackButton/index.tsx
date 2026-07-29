import { ArrowLeft } from "lucide-react";
import type { ComponentProps } from "react";
import { BackButtonRoot } from "./styles";

type BackButtonProps = ComponentProps<"button">;

export function BackButton({
  type = "button",
  "aria-label": ariaLabel = "Voltar ao cardapio",
  ...props
}: BackButtonProps) {
  return (
    <BackButtonRoot
      type={type}
      aria-label={ariaLabel}
      {...props}
    >
      <ArrowLeft size={20} aria-hidden="true" />
    </BackButtonRoot>
  );
}
