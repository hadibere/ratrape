"use client";

import Link from "next/link";
import { RatMark } from "@/components/brand/rat-mark";
import { EmptyState } from "@/components/listings/empty-state";
import { FilterChips } from "@/components/listings/filter-chips";
import { ListingCard, ListingRow } from "@/components/listings/listing-card";
import { LazyNeighborhoodMap } from "@/components/map/lazy-neighborhood-map";
import { CollectionBanner } from "@/components/map-screen/collection-banner";
import { CollectionPill } from "@/components/map-screen/collection-pill";
import { LocateButton } from "@/components/map-screen/locate-button";
import { useNeighborhood } from "@/components/shell/neighborhood-context";
import { useIsWide } from "@/components/shell/use-is-wide";
import { COMMUNE } from "@/lib/commune";

const Wordmark = () => (
  <>
    {/* Le mot reste lisible d'un bloc pour les lecteurs d'écran. */}
    <span className="sr-only">Ratrape</span>
    <span aria-hidden="true">
      {"Rat"}
      <RatMark className="mx-[0.07em] inline h-[0.72em] w-auto" />
      {"rape"}
    </span>
  </>
);

/**
 * Écran de la carte.
 *
 * Deux mises en page distinctes plutôt qu'une seule adaptée : sous 900 px la
 * carte occupe l'écran et le reste flotte au-dessus, au-delà elle vit dans la
 * colonne de gauche et ce panneau reste une liste ordinaire.
 */
export function MapPanel() {
  const { visible, filter, setFilter, center, located, total, nearestMeters } = useNeighborhood();
  const isWide = useIsWide();

  const subtitle =
    total === 0
      ? `${COMMUNE.name} · aucun objet pour le moment`
      : `${COMMUNE.name} · ${total} objet${total > 1 ? "s" : ""} à récupérer`;

  const listings = visible.map((item) => item.listing);

  return (
    <>
      {/* Sous 900 px : la carte est la page. */}
      <div className="wide:hidden bg-map relative min-h-0 flex-1">
        {isWide === false ? (
          <LazyNeighborhoodMap
            listings={listings}
            center={center}
            located={located}
            variant="narrow"
            className="absolute inset-0 h-full w-full"
          />
        ) : null}

        <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2.5 p-3.5">
          <div className="bg-surface shadow-overlay relative flex items-center gap-3 rounded-[18px] px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-ink text-[19px]/[1.15] font-bold">
                <Wordmark />
              </h1>
              <p className="text-muted mt-0.5 truncate text-[11.5px]">{subtitle}</p>
            </div>
            <CollectionPill />
          </div>

          <FilterChips value={filter} onChange={setFilter} className="pb-0.5" />
          <LocateButton className="shadow-overlay" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 pb-[max(14px,env(safe-area-inset-bottom))]">
          <div className="scrl flex gap-2.5 overflow-x-auto px-3.5">
            {visible.length === 0 ? (
              <EmptyState
                filter={filter}
                total={total}
                nearestMeters={nearestMeters}
                className="bg-card shadow-overlay w-full"
              />
            ) : (
              visible.map(({ listing, meters }) => (
                <ListingCard key={listing.id} listing={listing} distanceMeters={meters} />
              ))
            )}
          </div>
          {/* Bouton calé sur son texte : il flotte, il n'a pas à barrer l'écran. */}
          <div className="flex justify-center px-3.5">
            <Link
              href="/deposer"
              className="bg-brand font-display shadow-cta hover:bg-brand-hover flex h-[54px] items-center justify-center rounded-[18px] px-7 text-[16px] font-bold text-white"
            >
              Je dépose un encombrant
            </Link>
          </div>
        </div>
      </div>

      {/* À partir de 900 px : panneau latéral, la carte occupe la colonne de gauche. */}
      <div className="wide:flex hidden min-h-0 flex-1 flex-col">
        <div className="border-line-soft flex-none border-b px-6 pt-[22px] pb-3.5">
          <h1 className="font-display text-ink text-[22px]/[1.15] font-bold">
            <Wordmark />
          </h1>
          <p className="text-muted mt-0.5 text-[13px]/[1.4]">{subtitle}</p>
          <CollectionBanner className="mt-3" />
          <LocateButton className="shadow-card mt-3" />
          <FilterChips value={filter} onChange={setFilter} className="mt-3.5 pb-0.5" />
        </div>

        <div className="scrl flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
          {visible.length === 0 ? (
            <EmptyState filter={filter} total={total} nearestMeters={nearestMeters} />
          ) : (
            visible.map(({ listing, meters }) => (
              <ListingRow key={listing.id} listing={listing} distanceMeters={meters} />
            ))
          )}
        </div>

        <div className="border-line-soft flex-none border-t px-6 pt-3.5 pb-[22px]">
          <Link
            href="/deposer"
            className="bg-brand font-display shadow-cta hover:bg-brand-hover flex h-14 w-full items-center justify-center rounded-[18px] text-[17px] font-bold text-white"
          >
            Je dépose un encombrant
          </Link>
        </div>
      </div>
    </>
  );
}
