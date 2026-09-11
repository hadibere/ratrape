"use client";

import { createContext, useContext } from "react";
import type { LatLng } from "@/lib/geo";
import type { Filter, Listing } from "@/lib/types";

export type NearbyListing = { listing: Listing; meters: number };

export type NeighborhoodValue = {
  /** Annonces filtrées, de la plus proche à la plus lointaine. */
  visible: NearbyListing[];
  filter: Filter;
  setFilter: (filter: Filter) => void;
  /** Position de l'utilisateur, ou centre du quartier si la géolocalisation est refusée. */
  center: LatLng;
  savedThisMonth: number;
};

const NeighborhoodContext = createContext<NeighborhoodValue | null>(null);

export const NeighborhoodProvider = NeighborhoodContext.Provider;

export function useNeighborhood(): NeighborhoodValue {
  const value = useContext(NeighborhoodContext);
  if (!value) throw new Error("useNeighborhood doit être utilisé dans NeighborhoodShell");
  return value;
}
