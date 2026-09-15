"use client";

import { useEffect, useRef, useState } from "react";
import { COMMUNE } from "@/lib/commune";

export type PickedAddress = { label: string; lat: number; lng: number };

/** Une adresse de la Base Adresse Nationale, restreinte à la commune. */
type Suggestion = PickedAddress & { id: string };

/**
 * Recherche filtrée sur le code INSEE de la commune, et non sur le code postal :
 * 78600 couvre aussi Le Mesnil-le-Roi, il laisserait passer la commune voisine.
 */
type SearchResult = { ok: true; suggestions: Suggestion[] } | { ok: false };

async function search(query: string, signal: AbortSignal): Promise<SearchResult> {
  const url =
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}` +
    `&citycode=${COMMUNE.inseeCode}&limit=5&autocomplete=1`;
  const response = await fetch(url, { signal });
  // Le service public est parfois saturé : un échec n'est pas une absence de résultat.
  if (!response.ok) return { ok: false };
  const data = (await response.json()) as {
    features?: {
      geometry: { coordinates: [number, number] };
      properties: { id: string; label: string; citycode: string };
    }[];
  };
  return {
    ok: true,
    suggestions: (data.features ?? [])
      .filter((feature) => feature.properties.citycode === COMMUNE.inseeCode)
      .map((feature) => ({
        id: feature.properties.id,
        label: feature.properties.label,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      })),
  };
}

type AddressSearchProps = {
  onPick: (address: PickedAddress) => void;
  autoFocus?: boolean;
};

/** Saisie d'adresse avec suggestions : le chemin de secours quand le GPS manque. */
export function AddressSearch({ onPick, autoFocus }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const picked = useRef(false);

  useEffect(() => {
    if (picked.current || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    // Un appel par frappe saturerait le service : on attend une pause.
    const timer = setTimeout(() => {
      setSearching(true);
      search(query, controller.signal)
        .then((result) => {
          setFailed(!result.ok);
          setSuggestions(result.ok ? result.suggestions : []);
        })
        .catch(() => setFailed(true))
        .finally(() => setSearching(false));
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div>
      <input
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => {
          picked.current = false;
          setQuery(event.target.value);
        }}
        placeholder={`Votre adresse à ${COMMUNE.name}`}
        autoComplete="street-address"
        className="border-line bg-card text-ink w-full rounded-2xl border px-[15px] py-[13px] text-[15px] font-semibold outline-none"
      />
      {searching && suggestions.length === 0 ? (
        <p className="text-muted mt-2 text-xs">Recherche…</p>
      ) : null}
      {suggestions.length > 0 ? (
        <ul className="border-line bg-card mt-2 overflow-hidden rounded-2xl border">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} className="border-line-soft border-t first:border-t-0">
              <button
                type="button"
                onClick={() => {
                  picked.current = true;
                  setQuery(suggestion.label);
                  setSuggestions([]);
                  onPick(suggestion);
                }}
                className="text-ink hover:bg-surface w-full cursor-pointer px-[15px] py-3 text-left text-sm font-semibold"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {query.trim().length >= 3 && !searching && suggestions.length === 0 ? (
        <p className={`mt-2 text-xs/[1.45] ${failed ? "text-danger" : "text-muted"}`}>
          {failed
            ? "Le service d’adresses ne répond pas. Réessayez dans un instant."
            : `Aucune adresse trouvée à ${COMMUNE.name}. Vérifiez le numéro et le nom de la rue.`}
        </p>
      ) : null}
    </div>
  );
}
