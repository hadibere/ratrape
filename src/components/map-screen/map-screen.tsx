"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/listings/empty-state";
import { FilterChips } from "@/components/listings/filter-chips";
import { ListingCard, ListingRow } from "@/components/listings/listing-card";
import { MapCanvas } from "@/components/map/map-canvas";
import { SavedCounter } from "@/components/map/saved-counter";
import { AppShell } from "@/components/shell/app-shell";
import { DEFAULT_CENTER, distanceMeters, type LatLng } from "@/lib/geo";
import type { Filter, Listing } from "@/lib/types";

type MapScreenProps = {
  listings: Listing[];
  savedThisMonth: number;
};

export function MapScreen({ listings, savedThisMonth }: MapScreenProps) {
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

  const withDistance = useMemo(
    () =>
      listings
        .map((listing) => ({ listing, meters: distanceMeters(center, listing) }))
        .sort((a, b) => a.meters - b.meters),
    [listings, center],
  );

  const visible = useMemo(() => {
    if (filter === "Tout") return withDistance;
    if (filter === "Moins de 500 m") return withDistance.filter((i) => i.meters < 500);
    return withDistance.filter((i) => i.listing.category === filter);
  }, [withDistance, filter]);

  const visibleListings = visible.map((i) => i.listing);

  return (
    <AppShell
      map={
        <>
          <MapCanvas
            listings={visibleListings}
            center={center}
            variant="wide"
            className="h-full w-full"
          />
          <SavedCounter
            count={savedThisMonth}
            className="bg-surface shadow-overlay absolute top-5 left-5 px-4 py-2.5 text-sm"
          />
        </>
      }
    >
      {/* En-tête, commun aux deux tailles */}
      <div className="wide:border-b wide:border-line-soft wide:px-6 wide:pt-[22px] wide:pb-3.5 flex-none px-5 pt-4 pb-3">
        <h1 className="font-display text-ink wide:text-[22px] text-[21px]/[1.15] font-bold">
          Kilajete
        </h1>
        <p className="text-muted mt-0.5 text-[13px]/[1.4]">
          Quartier Saint-Roch · encombrants à récupérer
        </p>
        <SavedCounter
          count={savedThisMonth}
          className="bg-brand-soft wide:hidden mt-3 px-3.5 py-2 text-[13px]"
        />
        <FilterChips value={filter} onChange={setFilter} className="wide:mt-3.5 mt-3 pb-0.5" />
      </div>

      {/* Carte, sous 900 px seulement : sur desktop elle occupe la colonne de gauche */}
      <MapCanvas
        listings={visibleListings}
        center={center}
        variant="narrow"
        className="wide:hidden min-h-[300px] flex-1"
      />

      {/* Liste verticale, à partir de 900 px */}
      <div className="scrl wide:flex hidden min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
        {visible.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          visible.map(({ listing, meters }) => (
            <ListingRow key={listing.id} listing={listing} distanceMeters={meters} />
          ))
        )}
      </div>

      {/* Pied : bande horizontale sous 900 px, bouton de dépôt partout */}
      <div className="bg-surface wide:border-t wide:border-line-soft wide:px-6 wide:pt-3.5 wide:pb-[22px] flex-none pt-3 pb-[18px]">
        <div className="scrl wide:hidden flex gap-2.5 overflow-x-auto px-5 pb-3">
          {visible.length === 0 ? (
            <EmptyState filter={filter} className="bg-card w-full" />
          ) : (
            visible.map(({ listing, meters }) => (
              <ListingCard key={listing.id} listing={listing} distanceMeters={meters} />
            ))
          )}
        </div>
        <div className="wide:px-0 px-5">
          <button
            type="button"
            className="bg-brand font-display shadow-cta hover:bg-brand-hover wide:h-14 h-[58px] w-full cursor-pointer rounded-[18px] text-[17px] font-bold text-white"
          >
            Je dépose un encombrant
          </button>
        </div>
      </div>
    </AppShell>
  );
}
