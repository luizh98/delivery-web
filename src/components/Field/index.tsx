import type { FieldProps, InputProps, SelectProps, TextareaProps } from "./types";
import {
  ErrorMessage,
  FieldRoot,
  InputRoot,
  SelectRoot,
  TextareaRoot,
} from "./styles";

export function Field({ label, error, children }: FieldProps) {
  return (
    <FieldRoot>
      <span>{label}</span>
      {children}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </FieldRoot>
  );
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <InputRoot
      className={className}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  mono = false,
  ...props
}: TextareaProps) {
  return (
    <TextareaRoot
      className={className}
      mono={mono}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <SelectRoot
      className={className}
      {...props}
    />
  );
}
