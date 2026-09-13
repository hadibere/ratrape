"use client";

import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LatLng } from "@/lib/geo";
import { swatchClass, type Listing } from "@/lib/types";

/**
 * MapLibre cherche son worker à côté de `import.meta.url`, ce qui donne la page
 * elle-même une fois le code empaqueté : le worker est alors refusé et plus
 * aucune tuile n'est demandée. On le sert donc depuis `public/`, où le script
 * `scripts/copy-maplibre-worker.mjs` le dépose.
 */
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

/** Fond de carte libre, sans clé d'API. */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Le style ne porte pas l'attribution : la licence OpenStreetMap l'impose, on l'ajoute. */
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

/** Étiquette courte affichée dans le pin, en attendant un jeu d'icônes. */
function pinTag(name: string): string {
  return name.split(" ")[0].toUpperCase().slice(0, 8);
}

type NeighborhoodMapProps = {
  listings: Listing[];
  center: LatLng;
  /** « narrow » sous 900 px, « wide » pour la colonne de gauche. */
  variant: "narrow" | "wide";
  className?: string;
};

export function NeighborhoodMap({
  listings,
  center,
  variant,
  className = "",
}: NeighborhoodMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const followUser = useRef(true);
  const [anchors, setAnchors] = useState<{ id: string; element: HTMLElement }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Une seule création : la carte survit aux changements d'écran sur desktop.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: STYLE_URL,
      center: [center.lng, center.lat],
      zoom: 15,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new AttributionControl({ compact: true, customAttribution: ATTRIBUTION }));
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");

    // Dès que l'habitant déplace la carte, on arrête de le recentrer.
    map.on("dragstart", () => {
      followUser.current = false;
    });

    map.on("load", () => setStatus("ready"));

    // Les échecs de tuiles ou de style sont silencieux par défaut : on les montre.
    // Seul un style absent empêche vraiment d'afficher quoi que ce soit.
    map.on("error", (event) => {
      console.error("[carte]", event.error?.message ?? event);
      if (!map.isStyleLoaded()) setStatus("error");
    });

    // Le conteneur prend sa taille après le montage : sans ça le canevas reste figé.
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);

    const userElement = document.createElement("div");
    userElement.className =
      "h-[18px] w-[18px] rounded-full border-[3px] border-surface bg-you shadow-you";
    userMarkerRef.current = new Marker({ element: userElement })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    mapRef.current = map;
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
    // Le centre initial ne doit pas recréer la carte : il est suivi plus bas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La position de l'utilisateur bouge : on déplace le point, et la vue tant qu'il n'a pas navigué.
  useEffect(() => {
    userMarkerRef.current?.setLngLat([center.lng, center.lat]);
    if (followUser.current) mapRef.current?.easeTo({ center: [center.lng, center.lat] });
  }, [center]);

  // Un ancrage vide par annonce ; le contenu du pin est rendu par React dans ce nœud.
  const ids = listings.map((listing) => listing.id).join("|");
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = listings.map((listing) => {
      const element = document.createElement("div");
      const marker = new Marker({ element, anchor: "bottom" })
        .setLngLat([listing.lng, listing.lat])
        .addTo(map);
      return { id: listing.id, element, marker };
    });
    setAnchors(markers.map(({ id, element }) => ({ id, element })));

    return () => {
      markers.forEach(({ marker }) => marker.remove());
      setAnchors([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  const pinSize =
    variant === "wide" ? "h-[58px] w-[58px] shadow-pin-wide" : "h-[52px] w-[52px] shadow-pin";

  return (
    <div ref={containerRef} className={`bg-map relative ${className}`}>
      {status !== "ready" ? (
        <div className="bg-map absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
          <p className="text-muted text-[13px]/[1.5] font-semibold">
            {status === "loading"
              ? "Chargement de la carte…"
              : "La carte ne répond pas. Les objets proches restent visibles dans la liste."}
          </p>
        </div>
      ) : null}
      {anchors.map(({ id, element }) => {
        const listing = byId.get(id);
        if (!listing) return null;
        return createPortal(
          <Link
            href={`/objet/${listing.id}`}
            aria-label={listing.name}
            className="flex flex-col items-center"
          >
            <span
              className={`border-brand text-ink relative flex items-center justify-center overflow-hidden rounded-full border-[3px] text-center font-mono text-[10px]/[1.1] font-bold ${pinSize} ${listing.photoUrl ? "" : swatchClass(listing.category)}`}
            >
              {listing.photoUrl ? (
                // Rendu dans un marqueur MapLibre : une balise simple suffit.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                pinTag(listing.name)
              )}
            </span>
            <span className="bg-brand -mt-1.5 h-2.5 w-2.5 rotate-45 rounded-[2px]" />
          </Link>,
          element,
          id,
        );
      })}
    </div>
  );
}
