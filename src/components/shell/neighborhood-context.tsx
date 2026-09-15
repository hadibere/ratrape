"use client";

import { createContext, useContext } from "react";
import type { LatLng } from "@/lib/geo";
import type { Filter, Listing } from "@/lib/types";

export type NearbyListing = { listing: Listing; meters: number };

/** Ce que le navigateur a répondu à la demande de position. */
export type GeoStatus = "pending" | "granted" | "denied" | "unavailable";

export type NeighborhoodValue = {
  /** Annonces filtrées, de la plus proche à la plus lointaine. */
  visible: NearbyListing[];
  filter: Filter;
  setFilter: (filter: Filter) => void;
  /** Position de l'utilisateur, ou centre du quartier si la géolocalisation est refusée. */
  center: LatLng;
  geo: GeoStatus;
  /** Redemande la position, après un refus ou une erreur. */
  retryGeo: () => void;
  /** Nombre d'annonces en ligne, avant filtrage : distingue « rien ici » de « rien qui corresponde ». */
  total: number;
  /** Distance du plus proche objet du quartier, filtres ignorés. */
  nearestMeters: number | null;
};

const NeighborhoodContext = createContext<NeighborhoodValue | null>(null);

export const NeighborhoodProvider = NeighborhoodContext.Provider;

export function useNeighborhood(): NeighborhoodValue {
  const value = useContext(NeighborhoodContext);
  if (!value) throw new Error("useNeighborhood doit être utilisé dans NeighborhoodShell");
  return value;
}
