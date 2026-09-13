import Link from "next/link";
import { formatDistance } from "@/lib/geo";
import { ListingPhoto } from "@/components/listings/listing-photo";
import type { Listing } from "@/lib/types";

type CardProps = {
  listing: Listing;
  distanceMeters: number;
};

const href = (listing: Listing) => `/objet/${listing.id}` as const;

/** Carte de la liste horizontale, sous 900 px. */
export function ListingCard({ listing, distanceMeters }: CardProps) {
  return (
    <Link
      href={href(listing)}
      className="border-line bg-card shadow-card w-[158px] flex-none overflow-hidden rounded-2xl border"
    >
      <ListingPhoto listing={listing} sizes="158px" className="border-line h-[78px] border-b" />
      <span className="block px-[11px] pt-[9px] pb-[11px]">
        <span className="font-display text-ink block text-sm/[1.2] font-bold">{listing.name}</span>
        <span className="text-muted mt-[3px] block text-xs">
          {formatDistance(distanceMeters)} · {listing.condition}
        </span>
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
          {formatDistance(distanceMeters)} · {listing.condition}
        </span>
      </span>
    </Link>
  );
}
