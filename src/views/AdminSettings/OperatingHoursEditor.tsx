"use client";

import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import type { BusinessHour, HolidayHour } from "@/types/api";
import {
  createHolidayHour,
  type OperatingHoursErrors,
  WEEK_DAYS,
} from "./operatingHours";
import {
  DayName,
  EmptyText,
  ErrorText,
  HolidayGrid,
  HolidayHeader,
  HolidayRow,
  HolidayTitle,
  HoursList,
  HoursRow,
  RowError,
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  StatusOptions,
  StatusToggle,
  TimeFields,
} from "./styles";

type OperatingHoursEditorProps = {
  businessHours: BusinessHour[];
  holidayHours: HolidayHour[];
  errors: OperatingHoursErrors;
  onBusinessHoursChange: (hours: BusinessHour[]) => void;
  onHolidayHoursChange: (hours: HolidayHour[]) => void;
};

type WorkStatusOptionsProps = {
  closed: boolean;
  label: string;
  onChange: (closed: boolean) => void;
};

function WorkStatusOptions({ closed, label, onChange }: WorkStatusOptionsProps) {
  return (
    <StatusOptions role="group" aria-label={label}>
      <StatusToggle>
        <input
          type="checkbox"
          checked={!closed}
          onChange={(event) => {
            if (event.target.checked) {
              onChange(false);
            }
          }}
        />
        <span>Trabalha</span>
      </StatusToggle>
      <StatusToggle>
        <input
          type="checkbox"
          checked={closed}
          onChange={(event) => {
            if (event.target.checked) {
              onChange(true);
            }
          }}
        />
        <span>Nao trabalha</span>
      </StatusToggle>
    </StatusOptions>
  );
}

export function OperatingHoursEditor({
  businessHours,
  holidayHours,
  errors,
  onBusinessHoursChange,
  onHolidayHoursChange,
}: OperatingHoursEditorProps) {
  function updateBusinessHour(index: number, changes: Partial<BusinessHour>) {
    onBusinessHoursChange(businessHours.map((hour, hourIndex) =>
      hourIndex === index ? { ...hour, ...changes } : hour));
  }

  function updateHoliday(index: number, changes: Partial<HolidayHour>) {
    onHolidayHoursChange(holidayHours.map((holiday, holidayIndex) =>
      holidayIndex === index ? { ...holiday, ...changes } : holiday));
  }

  function removeHoliday(index: number) {
    onHolidayHoursChange(holidayHours.filter((_, holidayIndex) => holidayIndex !== index));
  }

  return (
    <>
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>Horario semanal</SectionTitle>
            <SectionDescription>
              Marque os dias abertos e informe o periodo de atendimento.
            </SectionDescription>
          </div>
        </SectionHeader>

        <HoursList>
          {WEEK_DAYS.map((day, index) => {
            const hour = businessHours[index];
            const error = errors.businessHours[day.value];

            return (
              <HoursRow key={day.value}>
                <DayName>{day.label}</DayName>
                <WorkStatusOptions
                  closed={Boolean(hour.closed)}
                  label={`Funcionamento de ${day.label}`}
                  onChange={(closed) => updateBusinessHour(index, { closed })}
                />
                {!hour.closed ? (
                  <TimeFields>
                    <Field label="Abre">
                      <Input
                        type="time"
                        value={hour.openTime ?? ""}
                        onChange={(event) => updateBusinessHour(index, {
                          openTime: event.target.value,
                        })}
                      />
                    </Field>
                    <Field label="Fecha">
                      <Input
                        type="time"
                        value={hour.closeTime ?? ""}
                        onChange={(event) => updateBusinessHour(index, {
                          closeTime: event.target.value,
                        })}
                      />
                    </Field>
                  </TimeFields>
                ) : <span />}
                {error ? <RowError>{error}</RowError> : null}
              </HoursRow>
            );
          })}
        </HoursList>
      </Section>

      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>Feriados e datas especiais</SectionTitle>
            <SectionDescription>
              Cadastre cada data e escolha se o restaurante fecha ou trabalha em horario especial.
            </SectionDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onHolidayHoursChange([...holidayHours, createHolidayHour()])}
          >
            <Plus size={16} />
            Adicionar feriado
          </Button>
        </SectionHeader>

        {holidayHours.length === 0 ? (
          <EmptyText>Nenhum feriado cadastrado.</EmptyText>
        ) : null}

        {holidayHours.map((holiday, index) => {
          const holidayErrors = errors.holidayHours[index];

          return (
            <HolidayRow key={index}>
              <HolidayHeader>
                <HolidayTitle>
                  <CalendarDays size={16} />
                  {holiday.name?.trim() || `Feriado ${index + 1}`}
                </HolidayTitle>
                <Button
                  type="button"
                  variant="dangerGhost"
                  aria-label={`Remover feriado ${index + 1}`}
                  onClick={() => removeHoliday(index)}
                >
                  <Trash2 size={16} />
                  Remover
                </Button>
              </HolidayHeader>

              <HolidayGrid>
                <Field label="Data" error={holidayErrors?.date}>
                  <Input
                    type="date"
                    value={holiday.date ?? ""}
                    onChange={(event) => updateHoliday(index, { date: event.target.value })}
                  />
                </Field>
                <Field label="Nome" error={holidayErrors?.name}>
                  <Input
                    value={holiday.name ?? ""}
                    placeholder="Ex.: Natal"
                    onChange={(event) => updateHoliday(index, { name: event.target.value })}
                  />
                </Field>
              </HolidayGrid>

              <WorkStatusOptions
                closed={Boolean(holiday.closed)}
                label={`Funcionamento de ${holiday.name?.trim() || `feriado ${index + 1}`}`}
                onChange={(closed) => updateHoliday(index, { closed })}
              />

              {!holiday.closed ? (
                <>
                  <TimeFields>
                    <Field label="Abre">
                      <Input
                        type="time"
                        value={holiday.openTime ?? ""}
                        onChange={(event) => updateHoliday(index, {
                          openTime: event.target.value,
                        })}
                      />
                    </Field>
                    <Field label="Fecha">
                      <Input
                        type="time"
                        value={holiday.closeTime ?? ""}
                        onChange={(event) => updateHoliday(index, {
                          closeTime: event.target.value,
                        })}
                      />
                    </Field>
                  </TimeFields>
                  {holidayErrors?.time ? <ErrorText>{holidayErrors.time}</ErrorText> : null}
                </>
              ) : null}
            </HolidayRow>
          );
        })}
      </Section>
    </>
  );
}
