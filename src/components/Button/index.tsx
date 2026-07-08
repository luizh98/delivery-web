import { cx } from "@/utils/classNames";
import type { ButtonProps, ButtonVariant } from "./types";
import styles from "./styles.module.css";

const variants: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  danger: styles.danger,
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(styles.button, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
