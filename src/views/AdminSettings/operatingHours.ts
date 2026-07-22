import type { BusinessHour, HolidayHour } from "@/types/api";

export const WEEK_DAYS = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terca-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sabado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

export type HolidayHourErrors = {
  date?: string;
  name?: string;
  time?: string;
};

export type OperatingHoursErrors = {
  businessHours: Partial<Record<string, string>>;
  holidayHours: Record<number, HolidayHourErrors>;
};

export function createWeeklyHours(hours: BusinessHour[] = []): BusinessHour[] {
  return WEEK_DAYS.map(({ value }) => {
    const current = hours.find((hour) => hour.dayOfWeek === value);

    return {
      dayOfWeek: value,
      openTime: current?.openTime ?? "09:00",
      closeTime: current?.closeTime ?? "18:00",
      closed: current ? (current.closed ?? false) : true,
    };
  });
}

export function createHolidayHour(): HolidayHour {
  return {
    date: "",
    name: "",
    openTime: "09:00",
    closeTime: "18:00",
    closed: true,
  };
}

export function createHolidayHours(hours: HolidayHour[] = []): HolidayHour[] {
  return hours.map((hour) => ({
    date: hour.date ?? "",
    name: hour.name ?? "",
    openTime: hour.openTime ?? "09:00",
    closeTime: hour.closeTime ?? "18:00",
    closed: hour.closed ?? true,
  }));
}

function invalidTimeValues(openTime?: string, closeTime?: string) {
  return !openTime || !closeTime || closeTime === openTime;
}

export function validateOperatingHours(
  businessHours: BusinessHour[],
  holidayHours: HolidayHour[],
): OperatingHoursErrors {
  const errors: OperatingHoursErrors = {
    businessHours: {},
    holidayHours: {},
  };

  businessHours.forEach((hour) => {
    if (!hour.closed && invalidTimeValues(hour.openTime, hour.closeTime)) {
      errors.businessHours[hour.dayOfWeek ?? ""] =
        "Informe abertura e fechamento com horarios diferentes.";
    }
  });

  const dateCounts = holidayHours.reduce<Record<string, number>>((counts, holiday) => {
    if (holiday.date) {
      counts[holiday.date] = (counts[holiday.date] ?? 0) + 1;
    }

    return counts;
  }, {});

  holidayHours.forEach((holiday, index) => {
    const holidayErrors: HolidayHourErrors = {};

    if (!holiday.date) {
      holidayErrors.date = "Informe a data.";
    } else if (dateCounts[holiday.date] > 1) {
      holidayErrors.date = "Ja existe um feriado nesta data.";
    }

    if (!holiday.name?.trim()) {
      holidayErrors.name = "Informe o nome.";
    }

    if (!holiday.closed && invalidTimeValues(holiday.openTime, holiday.closeTime)) {
      holidayErrors.time =
        "Informe abertura e fechamento com horarios diferentes.";
    }

    if (Object.keys(holidayErrors).length > 0) {
      errors.holidayHours[index] = holidayErrors;
    }
  });

  return errors;
}

export function hasOperatingHoursErrors(errors: OperatingHoursErrors) {
  return Object.keys(errors.businessHours).length > 0 ||
    Object.keys(errors.holidayHours).length > 0;
}

export function normalizeBusinessHours(hours: BusinessHour[]): BusinessHour[] {
  return hours.map((hour) => hour.closed
    ? { dayOfWeek: hour.dayOfWeek, closed: true }
    : {
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        closed: false,
      });
}

export function normalizeHolidayHours(hours: HolidayHour[]): HolidayHour[] {
  return hours
    .map((hour) => hour.closed
      ? {
          date: hour.date,
          name: hour.name?.trim(),
          closed: true,
        }
      : {
          date: hour.date,
          name: hour.name?.trim(),
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          closed: false,
        })
    .sort((left, right) => (left.date ?? "").localeCompare(right.date ?? ""));
}
