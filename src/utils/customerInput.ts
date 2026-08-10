export function normalizeBrazilianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  const hasExplicitCountryCode = value.trim().startsWith("+") && digits.startsWith("55");
  const hasOverflowCountryCode = digits.length > 11 && digits.startsWith("55");
  const nationalNumber = hasExplicitCountryCode || hasOverflowCountryCode
    ? digits.slice(2)
    : digits;

  return nationalNumber.slice(0, 11);
}

export function isValidBrazilianMobile(value: string) {
  return /^[1-9]\d9\d{8}$/.test(value);
}

export function formatBrazilianDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function brazilianDateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year)
    || date.getUTCMonth() !== Number(month) - 1
    || date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

export function isValidPastBrazilianDate(value: string) {
  const isoDate = brazilianDateToIso(value);
  if (!isoDate) {
    return false;
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return isoDate < today;
}

export function formatIsoDateToBrazilian(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}
