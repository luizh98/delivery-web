const OPERATIONS_TIME_ZONE = "America/Sao_Paulo";

function dateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: OPERATIONS_TIME_ZONE,
  }).formatToParts(date);

  return parts
    .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
    .map((part) => `${part.type}:${part.value}`)
    .join("|");
}

export function formatClosedStoreMessage(
  nextOpeningAt?: string,
  now = new Date(),
) {
  if (!nextOpeningAt) {
    return "Loja fechada";
  }

  const nextOpening = new Date(nextOpeningAt);

  if (Number.isNaN(nextOpening.getTime())) {
    return "Loja fechada";
  }

  const weekday = nextOpening.toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: OPERATIONS_TIME_ZONE,
  });
  const time = nextOpening.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: OPERATIONS_TIME_ZONE,
  });
  const openingDay =
    dateKey(nextOpening) === dateKey(now) ? "hoje" : weekday;

  return `Loja fechada, abre ${openingDay} às ${time}`;
}
