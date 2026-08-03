import { getRestaurantConfig } from "@/services/api/server";

type AutocompleteRequest = {
  input?: unknown;
  sessionToken?: unknown;
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
};

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,36}$/;

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Busca de endereço indisponível." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as AutocompleteRequest | null;
  const input = typeof body?.input === "string" ? body.input.trim() : "";
  const sessionToken =
    typeof body?.sessionToken === "string" ? body.sessionToken : "";

  if (input.length < 3 || !SESSION_TOKEN_PATTERN.test(sessionToken)) {
    return Response.json({ error: "Busca de endereço inválida." }, { status: 400 });
  }

  const restaurantConfig = await getRestaurantConfig();
  const city = restaurantConfig?.address?.city?.trim() ?? "";
  const state = restaurantConfig?.address?.state?.trim() ?? "";

  if (!city) {
    return Response.json(
      { error: "Cidade do restaurante não configurada." },
      { status: 503 },
    );
  }

  const configuredCity = normalizeLocation(city);
  const location = [city, state].filter(Boolean).join(" - ");

  try {
    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
        },
        body: JSON.stringify({
          input: `${input}, ${location}`,
          sessionToken,
          includedRegionCodes: ["br"],
          languageCode: "pt-BR",
          regionCode: "br",
        }),
        cache: "no-store",
      },
    );

    if (!googleResponse.ok) {
      return Response.json(
        { error: "Não foi possível buscar endereços." },
        { status: 502 },
      );
    }

    const data = (await googleResponse.json()) as GoogleAutocompleteResponse;
    const suggestions = (data.suggestions ?? [])
      .flatMap((suggestion) => {
        const prediction = suggestion.placePrediction;

        if (!prediction?.placeId || !prediction.text?.text) {
          return [];
        }

        return [{ placeId: prediction.placeId, text: prediction.text.text }];
      })
      .filter((suggestion) =>
        normalizeLocation(suggestion.text).includes(configuredCity),
      )
      .slice(0, 5);

    return Response.json({ suggestions });
  } catch {
    return Response.json(
      { error: "Não foi possível buscar endereços." },
      { status: 502 },
    );
  }
}
