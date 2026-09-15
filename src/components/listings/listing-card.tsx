import Link from "next/link";
import { formatDistance, formatWalk } from "@/lib/geo";
import { ListingPhoto } from "@/components/listings/listing-photo";
import type { Listing } from "@/lib/types";

type CardProps = {
  listing: Listing;
  /** Nulle tant que la position de l'habitant est inconnue. */
  distanceMeters: number | null;
};

const href = (listing: Listing) => `/objet/${listing.id}` as const;

/**
 * Carte de la bande du bas, sous 900 px.
 *
 * Horizontale et courte : elle flotte au-dessus de la carte, qui doit rester
 * visible derrière elle.
 */
export function ListingCard({ listing, distanceMeters }: CardProps) {
  const walk = distanceMeters === null ? null : formatWalk(distanceMeters);
  return (
    <Link
      href={href(listing)}
      className="border-line bg-card shadow-card flex w-[190px] flex-none items-stretch gap-2.5 overflow-hidden rounded-2xl border"
    >
      <ListingPhoto listing={listing} sizes="66px" className="w-[66px] flex-none" />
      <span className="flex min-w-0 flex-col justify-center py-2 pr-2.5">
        <span className="font-display text-ink block truncate text-sm/[1.2] font-bold">
          {listing.name}
        </span>
        <span className="text-muted mt-[3px] block text-xs">
          {distanceMeters === null
            ? listing.condition
            : `${formatDistance(distanceMeters)} · ${listing.condition}`}
        </span>
        {walk ? (
          <span className="text-brand mt-[3px] block text-xs font-semibold">{walk}</span>
        ) : null}
      </span>
    </Link>
  );
}

/** Rangée de la liste verticale, à partir de 900 px. */
export function ListingRow({ listing, distanceMeters }: CardProps) {
  return (
    <Link
      href={href(listing)}
      className="border-line bg-card flex items-center gap-3 rounded-2xl border p-2.5"
    >
      <ListingPhoto
        listing={listing}
        sizes="76px"
        className="h-[66px] w-[76px] flex-none rounded-xl"
      />
      <span className="block min-w-0">
        <span className="font-display text-ink block text-[15px]/[1.2] font-bold">
          {listing.name}
        </span>
        <span className="text-muted mt-1 block text-xs">{listing.address}</span>
        <span className="text-brand mt-[3px] block text-xs font-semibold">
          {distanceMeters === null
            ? listing.condition
            : `${formatDistance(distanceMeters)} · ${listing.condition}`}
        </span>
      </span>
    </Link>
  );
}
