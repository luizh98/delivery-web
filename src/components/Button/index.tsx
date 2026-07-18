import type { ButtonProps, ButtonVariant } from "./types";
import { ButtonRoot } from "./styles";

const variants: Record<ButtonVariant, ButtonVariant> = {
  primary: "primary",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "danger",
  dangerGhost: "dangerGhost",
  dangerText: "dangerText",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonRoot
      className={className}
      variant={variants[variant]}
      {...props}
    >
      {children}
    </ButtonRoot>
  );
}
