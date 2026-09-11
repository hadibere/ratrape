"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LazyNeighborhoodMap } from "@/components/map/lazy-neighborhood-map";
import { SavedCounter } from "@/components/map/saved-counter";
import { AppShell } from "@/components/shell/app-shell";
import { NeighborhoodProvider, type NeighborhoodValue } from "./neighborhood-context";
import { useIsWide } from "./use-is-wide";
import { DEFAULT_CENTER, distanceMeters, type LatLng } from "@/lib/geo";
import type { Filter, Listing } from "@/lib/types";

type NeighborhoodShellProps = {
  listings: Listing[];
  savedThisMonth: number;
  children: ReactNode;
};

/**
 * Coque du quartier, partagée par tous les écrans.
 *
 * Elle vit dans le layout, donc la carte de gauche reste montée quand on passe
 * de la carte à une fiche : seul le contenu du panneau change.
 */
export function NeighborhoodShell({ listings, savedThisMonth, children }: NeighborhoodShellProps) {
  const isWide = useIsWide();
  const [filter, setFilter] = useState<Filter>("Tout");
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);

  // Position réelle si l'utilisateur l'autorise, sinon on garde le centre du quartier.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const value = useMemo<NeighborhoodValue>(() => {
    const nearby = listings
      .map((listing) => ({ listing, meters: distanceMeters(center, listing) }))
      .sort((a, b) => a.meters - b.meters);

    const visible =
      filter === "Tout"
        ? nearby
        : filter === "Moins de 500 m"
          ? nearby.filter((item) => item.meters < 500)
          : nearby.filter((item) => item.listing.category === filter);

    return { visible, filter, setFilter, center, savedThisMonth };
  }, [listings, center, filter, savedThisMonth]);

  return (
    <NeighborhoodProvider value={value}>
      <AppShell
        map={
          <>
            {isWide ? (
              <LazyNeighborhoodMap
                listings={value.visible.map((item) => item.listing)}
                center={center}
                variant="wide"
                className="h-full w-full"
              />
            ) : null}
            <SavedCounter
              count={savedThisMonth}
              className="bg-surface shadow-overlay absolute top-5 left-5 z-10 px-4 py-2.5 text-sm"
            />
          </>
        }
      >
        {children}
      </AppShell>
    </NeighborhoodProvider>
  );
}
