"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LazyNeighborhoodMap } from "@/components/map/lazy-neighborhood-map";
import { AppShell } from "@/components/shell/app-shell";
import {
  NeighborhoodProvider,
  type GeoStatus,
  type NeighborhoodValue,
} from "./neighborhood-context";
import { useIsWide } from "./use-is-wide";
import { DEFAULT_CENTER } from "@/lib/commune";
import { distanceMeters, type LatLng } from "@/lib/geo";
import type { Filter, Listing } from "@/lib/types";

type NeighborhoodShellProps = {
  listings: Listing[];
  children: ReactNode;
};

/**
 * Coque du quartier, partagée par tous les écrans.
 *
 * Elle vit dans le layout, donc la carte de gauche reste montée quand on passe
 * de la carte à une fiche : seul le contenu du panneau change.
 */
export function NeighborhoodShell({ listings, children }: NeighborhoodShellProps) {
  const isWide = useIsWide();
  const [filter, setFilter] = useState<Filter>("Tout");
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [geo, setGeo] = useState<GeoStatus>("pending");
  const [geoAttempt, setGeoAttempt] = useState(0);

  // Position réelle si l'habitant l'autorise, sinon le centre du quartier, mais
  // en le disant : sans ça, il verrait des distances absurdes sans comprendre.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // Reporté d'un tour : changer d'état pendant l'effet relancerait un rendu en cascade.
      const timer = setTimeout(() => setGeo("unavailable"), 0);
      return () => clearTimeout(timer);
    }
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeo("granted");
      },
      (error) => setGeo(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [geoAttempt]);

  const value = useMemo<NeighborhoodValue>(() => {
    const nearby = listings
      .map((listing) => ({ listing, meters: distanceMeters(center, listing) }))
      .sort((a, b) => a.meters - b.meters);

    // Ratrape tient dans une commune de 3 km de côté : filtrer par distance
    // n'apprenait rien, tout est à portée de marche ou presque.
    const visible =
      filter === "Tout" ? nearby : nearby.filter((item) => item.listing.category === filter);

    return {
      visible,
      filter,
      setFilter,
      center,
      geo,
      retryGeo: () => {
        setGeo("pending");
        setGeoAttempt((attempt) => attempt + 1);
      },
      total: listings.length,
      // Calculé sur tout le quartier : c'est ce qui permet de dire « le plus
      // proche est à 3 km » quand la liste filtrée ne renvoie rien.
      nearestMeters: nearby[0]?.meters ?? null,
    };
  }, [listings, center, filter, geo]);

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
          </>
        }
      >
        {children}
      </AppShell>
    </NeighborhoodProvider>
  );
}
