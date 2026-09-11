"use client";

import Link from "next/link";

import { EmptyState } from "@/components/listings/empty-state";
import { FilterChips } from "@/components/listings/filter-chips";
import { ListingCard, ListingRow } from "@/components/listings/listing-card";
import { MapCanvas } from "@/components/map/map-canvas";
import { SavedCounter } from "@/components/map/saved-counter";
import { useNeighborhood } from "@/components/shell/neighborhood-context";

/** Contenu du panneau pour l'écran carte : en-tête, filtres, listes et dépôt. */
export function MapPanel() {
  const { visible, filter, setFilter, center, savedThisMonth } = useNeighborhood();

  return (
    <>
      <div className="wide:border-line-soft wide:px-6 wide:pt-[22px] wide:pb-3.5 wide:border-b flex-none px-5 pt-4 pb-3">
        <h1 className="wide:text-[22px] font-display text-ink text-[21px]/[1.15] font-bold">
          Kilajete
        </h1>
        <p className="text-muted mt-0.5 text-[13px]/[1.4]">
          Quartier Saint-Roch · encombrants à récupérer
        </p>
        <SavedCounter
          count={savedThisMonth}
          className="wide:hidden bg-brand-soft mt-3 px-3.5 py-2 text-[13px]"
        />
        <FilterChips value={filter} onChange={setFilter} className="wide:mt-3.5 mt-3 pb-0.5" />
      </div>

      {/* Sous 900 px la carte s'insère dans la colonne ; au-delà elle occupe la gauche */}
      <MapCanvas
        listings={visible.map((item) => item.listing)}
        center={center}
        variant="narrow"
        className="wide:hidden min-h-[300px] flex-1"
      />

      <div className="scrl wide:flex hidden min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
        {visible.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          visible.map(({ listing, meters }) => (
            <ListingRow key={listing.id} listing={listing} distanceMeters={meters} />
          ))
        )}
      </div>

      <div className="wide:border-line-soft wide:px-6 wide:pt-3.5 wide:pb-[22px] bg-surface wide:border-t flex-none pt-3 pb-[18px]">
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
          <Link
            href="/deposer"
            className="wide:h-14 bg-brand font-display shadow-cta hover:bg-brand-hover flex h-[58px] w-full items-center justify-center rounded-[18px] text-[17px] font-bold text-white"
          >
            Je dépose un encombrant
          </Link>
        </div>
      </div>
    </>
  );
}
