import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { ErrorMessage, FieldRoot } from "@/components/Field/styles";
import { GuestCountControls } from "./styles";

type Props = {
  label: string;
  value: string;
  registration: UseFormRegisterReturn;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function GuestCountField({ label, value, registration, onChange, error, disabled = false }: Props) {
  const id = useId();
  const count = Number.isInteger(Number(value)) ? Number(value) : 0;
  function step(delta: number) { onChange(String(Math.min(999, Math.max(1, count + delta)))); }
  return <FieldRoot as="div">
    <label htmlFor={id}>{label}</label>
    <GuestCountControls role="group" aria-label={label}>
      <Button type="button" variant="outline" aria-label="Diminuir pessoas" disabled={disabled || count <= 1} onClick={() => step(-1)}><Minus size={24} aria-hidden="true" /></Button>
      <Input id={id} type="number" inputMode="numeric" min={1} max={999} step={1} placeholder="Não informado" disabled={disabled} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...registration} />
      <Button type="button" variant="outline" aria-label="Aumentar pessoas" disabled={disabled || count >= 999} onClick={() => step(1)}><Plus size={24} aria-hidden="true" /></Button>
    </GuestCountControls>
    {error ? <ErrorMessage id={`${id}-error`} role="alert">{error}</ErrorMessage> : null}
  </FieldRoot>;
}
