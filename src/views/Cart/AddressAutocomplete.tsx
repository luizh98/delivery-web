"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Search } from "lucide-react";
import { Field, Input } from "@/components/Field";
import {
  AddressSearchControl,
  AddressSearchIcon,
  AddressSearchStatus,
  AddressSuggestion,
  AddressSuggestions,
  GoogleMapsAttribution,
} from "./styles";

export type AddressSelection = {
  formattedAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

type Suggestion = {
  placeId: string;
  text: string;
};

type AddressAutocompleteProps = {
  onSelect: (address: AddressSelection) => void;
};

async function responseError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;

  return typeof data?.error === "string" ? data.error : fallback;
}

export function AddressAutocomplete({ onSelect }: AddressAutocompleteProps) {
  const sessionToken = useRef("");
  const selectedQuery = useRef("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionToken.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    const input = query.trim();

    if (
      input.length < 3 ||
      selecting ||
      input === selectedQuery.current
    ) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input,
            sessionToken: sessionToken.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await responseError(
              response,
              "Busca indisponível. Preencha o endereço manualmente.",
            ),
          );
        }

        const data = (await response.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setSuggestions([]);
        setError(
          requestError instanceof Error && requestError.message
            ? requestError.message
            : "Busca indisponível. Preencha o endereço manualmente.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selecting]);

  async function selectSuggestion(suggestion: Suggestion) {
    setSelecting(true);
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/places/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: suggestion.placeId,
          sessionToken: sessionToken.current,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await responseError(
            response,
            "Não foi possível preencher. Informe o endereço manualmente.",
          ),
        );
      }

      const address = (await response.json()) as AddressSelection;
      const selectedAddress = address.formattedAddress || suggestion.text;
      selectedQuery.current = selectedAddress.trim();
      setQuery(selectedAddress);
      onSelect(address);
      sessionToken.current = crypto.randomUUID();
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "Não foi possível preencher. Informe o endereço manualmente.",
      );
    } finally {
      setLoading(false);
      setSelecting(false);
    }
  }

  return (
    <Field label="Buscar endereço">
      <AddressSearchControl>
        <AddressSearchIcon aria-hidden="true">
          {loading ? (
            <LoaderCircle className="address-search-spinner" size={17} />
          ) : (
            <Search size={17} />
          )}
        </AddressSearchIcon>
        <Input
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            selectedQuery.current = "";
            setQuery(nextQuery);

            if (nextQuery.trim().length < 3) {
              setSuggestions([]);
              setError("");
            }
          }}
          placeholder="Digite rua e número"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="address-suggestions"
        />
      </AddressSearchControl>

      {suggestions.length > 0 ? (
        <AddressSuggestions id="address-suggestions" role="listbox">
          {suggestions.map((suggestion) => (
            <AddressSuggestion
              key={suggestion.placeId}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => selectSuggestion(suggestion)}
            >
              <MapPin size={16} />
              <span>{suggestion.text}</span>
            </AddressSuggestion>
          ))}
          <GoogleMapsAttribution translate="no">Google Maps</GoogleMapsAttribution>
        </AddressSuggestions>
      ) : null}

      {error ? <AddressSearchStatus role="status">{error}</AddressSearchStatus> : null}
    </Field>
  );
}
