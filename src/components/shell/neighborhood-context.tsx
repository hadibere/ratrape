"use client";

import { createContext, useContext } from "react";
import type { LatLng } from "@/lib/geo";
import type { Listing } from "@/lib/types";

/**
 * État de la demande de position.
 *
 * « idle » : rien n'a été demandé. C'est l'état d'arrivée sur le site : on ne
 * réclame pas une autorisation avant d'avoir montré à quoi elle sert.
 */
export type GeoStatus = "idle" | "pending" | "granted" | "denied" | "unavailable";

/** Distance nulle tant que la position réelle est inconnue : mieux vaut rien qu'un chiffre faux. */
export type NearbyListing = { listing: Listing; meters: number | null };

export type NeighborhoodValue = {
  /** Annonces de la plus proche à la plus lointaine si la position est connue. */
  visible: NearbyListing[];
  /** Position de l'habitant, ou centre de la commune tant qu'elle est inconnue. */
  center: LatLng;
  /** Vraie position obtenue, par opposition au centre de repli. */
  located: boolean;
  geo: GeoStatus;
  /** Demande la position ; c'est aux écrans de choisir le bon moment. */
  requestGeo: () => void;
  /** Nombre d'annonces en ligne, annoncé sous le titre. */
  total: number;
};

const NeighborhoodContext = createContext<NeighborhoodValue | null>(null);

export const NeighborhoodProvider = NeighborhoodContext.Provider;

export function useNeighborhood(): NeighborhoodValue {
  const value = useContext(NeighborhoodContext);
  if (!value) throw new Error("useNeighborhood doit être utilisé dans NeighborhoodShell");
  return value;
}
