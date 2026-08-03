import { getRestaurantConfig } from "@/services/api/server";

type DetailsRequest = {
  placeId?: unknown;
  sessionToken?: unknown;
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlaceDetails = {
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
};

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,36}$/;

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function component(
  components: GoogleAddressComponent[],
  types: string[],
  short = false,
) {
  const match = components.find((item) =>
    types.some((type) => item.types?.includes(type)),
  );

  return (short ? match?.shortText : match?.longText) ?? "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Busca de endereço indisponível." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as DetailsRequest | null;
  const placeId = typeof body?.placeId === "string" ? body.placeId.trim() : "";
  const sessionToken =
    typeof body?.sessionToken === "string" ? body.sessionToken : "";

  if (!placeId || !SESSION_TOKEN_PATTERN.test(sessionToken)) {
    return Response.json({ error: "Endereço inválido." }, { status: 400 });
  }

  const restaurantConfig = await getRestaurantConfig();
  const configuredCity = restaurantConfig?.address?.city?.trim() ?? "";
  const configuredState = restaurantConfig?.address?.state?.trim() ?? "";

  if (!configuredCity) {
    return Response.json(
      { error: "Cidade do restaurante não configurada." },
      { status: 503 },
    );
  }

  const query = new URLSearchParams({
    sessionToken,
    languageCode: "pt-BR",
    regionCode: "br",
  });

  try {
    const googleResponse = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${query}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "formattedAddress,addressComponents",
        },
        cache: "no-store",
      },
    );

    if (!googleResponse.ok) {
      return Response.json(
        { error: "Não foi possível carregar o endereço." },
        { status: 502 },
      );
    }

    const data = (await googleResponse.json()) as GooglePlaceDetails;
    const components = data.addressComponents ?? [];
    const city = component(components, [
      "locality",
      "administrative_area_level_2",
    ]);
    const state = component(components, ["administrative_area_level_1"], true);

    const cityMatches =
      normalizeLocation(city) === normalizeLocation(configuredCity);
    const stateMatches =
      !configuredState ||
      normalizeLocation(state) === normalizeLocation(configuredState);

    if (!cityMatches || !stateMatches) {
      return Response.json(
        { error: `Selecione um endereço em ${configuredCity}.` },
        { status: 422 },
      );
    }

    return Response.json({
      formattedAddress: data.formattedAddress ?? "",
      street: component(components, ["route"]),
      number: component(components, ["street_number"]),
      neighborhood: component(components, [
        "sublocality_level_1",
        "sublocality",
        "neighborhood",
      ]),
      city,
      state,
      zipCode: component(components, ["postal_code"]),
    });
  } catch {
    return Response.json(
      { error: "Não foi possível carregar o endereço." },
      { status: 502 },
    );
  }
}
