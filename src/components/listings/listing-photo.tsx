import Image from "next/image";
import { CategoryIcon } from "@/components/listings/category-icon";
import type { Listing } from "@/lib/types";

type ListingPhotoProps = {
  listing: Listing;
  /** Taille et arrondi du cadre, fourni par l'appelant. */
  className?: string;
  /** Largeur d'affichage annoncée au navigateur, pour choisir la bonne résolution. */
  sizes: string;
  priority?: boolean;
};

/**
 * Photo de l'annonce, ou aplat rayé tant qu'aucune image n'a été déposée.
 * Les annonces d'exemple et les anciens dépôts n'en ont pas.
 */
export function ListingPhoto({ listing, className = "", sizes, priority }: ListingPhotoProps) {
  if (!listing.photoUrl) {
    return (
      <span className={`bg-brand-soft text-brand flex items-center justify-center ${className}`}>
        <CategoryIcon category={listing.category} className="h-2/5 w-2/5" />
      </span>
    );
  }
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src={listing.photoUrl}
        alt={listing.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
