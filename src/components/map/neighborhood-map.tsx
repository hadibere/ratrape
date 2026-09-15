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
import { CategoryIcon } from "@/components/listings/category-icon";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COMMUNE, COMMUNE_GEOJSON, OUTSIDE_COMMUNE_GEOJSON } from "@/lib/commune";
import type { LatLng } from "@/lib/geo";
import type { Listing } from "@/lib/types";

/**
 * MapLibre cherche son worker à côté de `import.meta.url`, ce qui donne la page
 * elle-même une fois le code empaqueté : le worker est alors refusé et plus
 * aucune tuile n'est demandée. On le sert donc depuis `public/`, où le script
 * `scripts/copy-maplibre-worker.mjs` le dépose.
 */
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

/** Marge autour de la commune, en degrés : environ 800 m. */
const MARGIN = 0.008;

/** Fond de carte libre, sans clé d'API. */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Le style ne porte pas l'attribution : la licence OpenStreetMap l'impose, on l'ajoute. */
const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

type NeighborhoodMapProps = {
  listings: Listing[];
  center: LatLng;
  /** Le point bleu ne s'affiche que si la position vient vraiment du navigateur. */
  located: boolean;
  /** « narrow » sous 900 px, « wide » pour la colonne de gauche. */
  variant: "narrow" | "wide";
  className?: string;
};

export function NeighborhoodMap({
  listings,
  center,
  located,
  variant,
  className = "",
}: NeighborhoodMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const [anchors, setAnchors] = useState<{ id: string; element: HTMLElement }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Une seule création : la carte survit aux changements d'écran sur desktop.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: STYLE_URL,
      // La commune entière plutôt que la position de l'habitant : Ratrape
      // couvre une ville, on la montre en entier dès l'ouverture.
      bounds: [
        [COMMUNE.bounds.west, COMMUNE.bounds.south],
        [COMMUNE.bounds.east, COMMUNE.bounds.north],
      ],
      fitBoundsOptions: { padding: 28 },
      // On ne s'éloigne pas de la ville : la marge laisse juste voir les rues
      // limitrophes, utiles pour se repérer.
      maxBounds: [
        [COMMUNE.bounds.west - MARGIN, COMMUNE.bounds.south - MARGIN],
        [COMMUNE.bounds.east + MARGIN, COMMUNE.bounds.north + MARGIN],
      ],
      minZoom: 12,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new AttributionControl({ compact: true, customAttribution: ATTRIBUTION }));
    // Les boutons de zoom n'ont pas d'intérêt sur un écran tactile, où le
    // pincement fait le travail, et ils encombrent une carte déjà chargée.
    if (variant === "wide") {
      map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    }

    map.on("load", () => {
      // Limite communale : au-delà, Ratrape ne connaît ni le calendrier ni les règles.
      map.addSource("commune", { type: "geojson", data: COMMUNE_GEOJSON });
      map.addSource("hors-commune", { type: "geojson", data: OUTSIDE_COMMUNE_GEOJSON });
      // Tout ce qui n'est pas la commune est voilé : d'un coup d'œil, on voit
      // jusqu'où va Ratrape sans avoir à lire quoi que ce soit.
      map.addLayer({
        id: "hors-commune-fill",
        type: "fill",
        source: "hors-commune",
        paint: { "fill-color": "#16231C", "fill-opacity": 0.22 },
      });
      map.addLayer({
        id: "commune-outline",
        type: "line",
        source: "commune",
        paint: {
          "line-color": "#1F7A4D",
          "line-width": 2.5,
          "line-dasharray": [2, 2],
        },
      });
      setStatus("ready");
    });

    // Les échecs de tuiles ou de style sont silencieux par défaut : on les montre.
    // Seul un style absent empêche vraiment d'afficher quoi que ce soit.
    map.on("error", (event) => {
      console.error("[carte]", event.error?.message ?? event);
      if (!map.isStyleLoaded()) setStatus("error");
    });

    // Le conteneur prend sa taille après le montage : sans ça le canevas reste figé.
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);

    mapRef.current = map;
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
    // La carte s'ouvre sur la commune, pas sur l'habitant : elle ne dépend plus
    // de sa position, seulement de la mise en page.
  }, [variant]);

  // Le point bleu apparaît avec la position et la suit ; la vue reste sur la commune.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !located) return;

    const element = document.createElement("div");
    element.className =
      "h-[18px] w-[18px] rounded-full border-[3px] border-surface bg-you shadow-you";
    const marker = new Marker({ element }).setLngLat([center.lng, center.lat]).addTo(map);
    userMarkerRef.current = marker;

    return () => {
      marker.remove();
      userMarkerRef.current = null;
    };
  }, [located, center]);

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
              className={`border-brand relative flex items-center justify-center overflow-hidden rounded-full border-[3px] ${pinSize} ${
                listing.photoUrl ? "" : "bg-brand-soft text-brand"
              }`}
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
                <CategoryIcon category={listing.category} className="h-1/2 w-1/2" />
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
