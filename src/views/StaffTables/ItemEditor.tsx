"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Field";
import { money } from "@/utils/format";
import { draftItemTotal, validateDraftItem, type DraftItem } from "./draft";
import { Actions, Dialog, Heading, Muted, Option, OptionSet, Row, Stack } from "./styles";

export function ItemEditor({ item, editing, onSave, onClose }: { item: DraftItem; editing: boolean; onSave: (item: DraftItem) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [options, setOptions] = useState(item.options);
  const form = useForm({ defaultValues: { quantity: item.quantity, observations: item.observations } });
  const [error, setError] = useState("");
  const values = { quantity: useWatch({ control: form.control, name: "quantity", defaultValue: item.quantity }), observations: item.observations };
  const current = { ...item, ...values, options };
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <Dialog ref={dialog} onCancel={onClose} aria-labelledby="item-editor-title">
    <form onSubmit={form.handleSubmit((data) => {
      const next = { ...item, ...data, options };
      const invalid = validateDraftItem(next);
      if (invalid) { setError(invalid); return; }
      onSave(next);
    })}>
      <Row><Heading id="item-editor-title">{item.product.name}</Heading><Button type="button" variant="ghost" onClick={onClose} aria-label="Fechar item"><X size={18} /></Button></Row>
      <Muted>{editing ? "Corrija este item antes de enviar a rodada." : "Escolha os detalhes para incluir na rodada."}</Muted>
      {(item.product.optionGroups ?? []).filter((group) => !group.deleted).map((group) => {
        const max = group.maxSelections > 0 ? group.maxSelections : 1;
        const min = Math.max(group.minSelections, group.required ? 1 : 0);
        return <OptionSet key={group.id}><legend>{group.name} · {min > 0 ? `escolha ${min === max ? min : `de ${min} a ${max}`}` : `até ${max} (opcional)`}</legend>
          {group.items.filter((option) => option.active && !option.deleted).map((option) => {
            const checked = options.some((entry) => entry.groupId === group.id && entry.itemId === option.id);
            return <Option key={option.id}><input type="checkbox" checked={checked} onChange={() => {
              setError("");
              if (checked) { setOptions(options.filter((entry) => entry.groupId !== group.id || entry.itemId !== option.id)); return; }
              const selected = options.filter((entry) => entry.groupId === group.id);
              if (max > 1 && selected.length >= max) { setError(`${group.name}: máximo de ${max} opções.`); return; }
              setOptions([...(max === 1 ? options.filter((entry) => entry.groupId !== group.id) : options), { groupId: group.id!, itemId: option.id! }]);
            }} /><span>{option.name}{option.priceCents > 0 ? ` · + ${money(option.priceCents)}` : ""}</span></Option>;
          })}
        </OptionSet>;
      })}
      <Stack><Field label="Observação para a cozinha"><Textarea maxLength={1000} placeholder="Ex.: sem cebola, carne bem passada" {...form.register("observations")} /></Field>
        <Field label="Quantidade" error={form.formState.errors.quantity?.message}><Actions>
          <Button type="button" variant="outline" aria-label="Diminuir quantidade" disabled={values.quantity <= 1} onClick={() => form.setValue("quantity", Math.max(1, values.quantity - 1))}><Minus size={18} /></Button>
          <Input aria-label="Quantidade" type="number" min={1} max={999} inputMode="numeric" {...form.register("quantity", { valueAsNumber: true, required: "Informe a quantidade.", min: { value: 1, message: "Mínimo: 1." }, max: { value: 999, message: "Máximo: 999." } })} />
          <Button type="button" variant="outline" aria-label="Aumentar quantidade" disabled={values.quantity >= 999} onClick={() => form.setValue("quantity", Math.min(999, values.quantity + 1))}><Plus size={18} /></Button>
        </Actions></Field>
      </Stack>
      {error ? <p role="alert">{error}</p> : null}
      <Button type="submit"><Plus size={18} />{editing ? "Salvar item" : "Adicionar à rodada"} · {money(Number.isFinite(current.quantity) ? draftItemTotal(current) : 0)}</Button>
    </form>
  </Dialog>;
}
