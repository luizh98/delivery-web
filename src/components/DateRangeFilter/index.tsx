"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { ptBR } from "@daypicker/react/locale";
import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Select } from "@/components/Field";
import { dateFromKey, dateKey, formatDateRange, getDatePreset, getPresetDateRange, rangeDays, type DateFilterRange, type DatePreset } from "./dates";
import { Actions, CalendarPanel, Hint, Popover, PopoverBody, PopoverHeader, RangeText, Wrap } from "./styles";

export { dateKey, getPresetDateRange } from "./dates";
export type { DateFilterRange } from "./dates";

const labels: Record<DatePreset, string> = { today: "Hoje", yesterday: "Ontem", last7: "Últimos 7 dias", thisMonth: "Este mês", custom: "Personalizado" };

export function DateRangeFilter({ value, onChange, maxDays }: {
  value: DateFilterRange;
  onChange: (range: DateFilterRange) => void;
  maxDays?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>();
  const [alignRight, setAlignRight] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const preset = getDatePreset(value);
  const complete = draft?.from && draft.to;
  const tooLong = complete && maxDays !== undefined && rangeDays(draft.from!, draft.to!) > maxDays;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!wrap.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); wrap.current?.querySelector("select")?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  function close() { setOpen(false); wrap.current?.querySelector("select")?.focus(); }
  function choose(selected: DatePreset) {
    if (selected === "custom") {
      setDraft({ from: dateFromKey(value.startDate), to: dateFromKey(value.endDate) });
      setAlignRight((wrap.current?.getBoundingClientRect().left ?? 0) > window.innerWidth / 2);
      setOpen(true);
    } else { onChange(getPresetDateRange(selected)); setOpen(false); }
  }

  return <Wrap ref={wrap}>
    <Field label={`Período: ${formatDateRange(value.startDate, value.endDate)}`}>
      <Select aria-label="Período" value="" onChange={(event) => choose(event.target.value as DatePreset)}>
        <option value="" disabled>{labels[preset]}</option>
        <option value="today">Hoje</option><option value="yesterday">Ontem</option><option value="last7">Últimos 7 dias</option><option value="thisMonth">Este mês</option><option value="custom">Personalizado</option>
      </Select>
    </Field>
    {open ? <Popover role="dialog" aria-labelledby={titleId} css={alignRight ? {} : { left: 0, right: "auto" }}>
      <PopoverHeader><div><strong id={titleId}>Período personalizado</strong><Hint>Selecione início e fim.</Hint></div><Button type="button" variant="outline" aria-label="Fechar período" onClick={close}><X size={16} aria-hidden="true" /></Button></PopoverHeader>
      <PopoverBody>
        <CalendarPanel><DayPicker mode="range" locale={ptBR} selected={draft} onSelect={setDraft} defaultMonth={draft?.from} resetOnSelect autoFocus /></CalendarPanel>
        <RangeText><CalendarDays size={16} aria-hidden="true" />{complete ? formatDateRange(dateKey(draft.from!), dateKey(draft.to!)) : "Selecione o início e o fim do período"}</RangeText>
        {tooLong ? <Hint role="alert">Selecione um período de até {maxDays} dias.</Hint> : null}
        <Actions><Button type="button" variant="outline" onClick={close}>Cancelar</Button><Button type="button" disabled={!complete || !!tooLong} onClick={() => { if (draft?.from && draft.to && !tooLong) { onChange({ startDate: dateKey(draft.from), endDate: dateKey(draft.to) }); close(); } }}>Aplicar período</Button></Actions>
      </PopoverBody>
    </Popover> : null}
  </Wrap>;
}
