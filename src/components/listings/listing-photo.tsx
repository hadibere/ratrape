import Image from "next/image";
import { swatchClass, type Listing } from "@/lib/types";

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
    return <span className={`block ${swatchClass(listing.category)} ${className}`} />;
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
