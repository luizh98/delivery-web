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

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Busca de endereco indisponivel." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as AutocompleteRequest | null;
  const input = typeof body?.input === "string" ? body.input.trim() : "";
  const sessionToken =
    typeof body?.sessionToken === "string" ? body.sessionToken : "";

  if (input.length < 3 || !SESSION_TOKEN_PATTERN.test(sessionToken)) {
    return Response.json({ error: "Busca de endereco invalida." }, { status: 400 });
  }

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
          input,
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
        { error: "Nao foi possivel buscar enderecos." },
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
      .slice(0, 5);

    return Response.json({ suggestions });
  } catch {
    return Response.json(
      { error: "Nao foi possivel buscar enderecos." },
      { status: 502 },
    );
  }
}
