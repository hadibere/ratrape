"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LazyNeighborhoodMap } from "@/components/map/lazy-neighborhood-map";
import { AppShell } from "@/components/shell/app-shell";
import {
  NeighborhoodProvider,
  type GeoStatus,
  type NearbyListing,
  type NeighborhoodValue,
} from "./neighborhood-context";
import { useIsWide } from "./use-is-wide";
import { DEFAULT_CENTER } from "@/lib/commune";
import { distanceMeters, type LatLng } from "@/lib/geo";
import type { Listing } from "@/lib/types";

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
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [geo, setGeo] = useState<GeoStatus>("idle");
  const [geoAttempt, setGeoAttempt] = useState(0);

  /**
   * Un refus déjà enregistré se lit sans rien demander : autant le savoir
   * d'emblée pour proposer la marche à suivre plutôt qu'un bouton inopérant.
   * Si l'habitant change d'avis dans ses réglages, on relance tout seul.
   */
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let cancelled = false;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (cancelled) return;
        if (status.state === "denied") setGeo("denied");
        status.onchange = () => {
          if (status.state === "granted") setGeoAttempt((attempt) => attempt + 1);
        };
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * La position n'est demandée que lorsqu'un écran la réclame.
   *
   * Surgir dès l'arrivée fait refuser par réflexe, et un refus se rétablit
   * difficilement : on paierait ce réflexe au moment du dépôt, là où la
   * position est indispensable.
   */
  useEffect(() => {
    if (geoAttempt === 0) return;
    if (!("geolocation" in navigator)) {
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

  const located = geo === "granted";

  const value = useMemo<NeighborhoodValue>(() => {
    // Sans position réelle, on garde l'ordre du serveur, le plus récent d'abord,
    // et aucune distance n'est annoncée.
    const nearby: NearbyListing[] = located
      ? listings
          .map((listing) => ({ listing, meters: distanceMeters(center, listing) }))
          .sort((a, b) => (a.meters ?? 0) - (b.meters ?? 0))
      : listings.map((listing) => ({ listing, meters: null }));

    return {
      visible: nearby,
      center,
      located,
      geo,
      requestGeo: () => {
        setGeo("pending");
        setGeoAttempt((attempt) => attempt + 1);
      },
      total: listings.length,
    };
  }, [listings, center, geo, located]);

  return (
    <NeighborhoodProvider value={value}>
      <AppShell
        map={
          <>
            {isWide ? (
              <LazyNeighborhoodMap
                listings={value.visible.map((item) => item.listing)}
                center={center}
                located={located}
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
