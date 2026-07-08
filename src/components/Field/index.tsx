import { cx } from "@/utils/classNames";
import type { FieldProps, InputProps, SelectProps, TextareaProps } from "./types";
import styles from "./styles.module.css";

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={cx(styles.control, className)}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cx(styles.control, styles.textarea, className)}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cx(styles.control, className)}
      {...props}
    />
  );
}
