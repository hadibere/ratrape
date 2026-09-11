import { offsetMeters, type LatLng } from "@/lib/geo";
import { swatchClass, type Listing } from "@/lib/types";

/** Étiquette courte affichée dans le pin, en attendant un jeu d'icônes. */
function pinTag(name: string): string {
  return name.split(" ")[0].toUpperCase().slice(0, 8);
}

/** Place un objet dans le cadre, en pourcentages, centré sur la position de l'utilisateur. */
function project(center: LatLng, listing: Listing, spanMeters: number) {
  const { east, north } = offsetMeters(center, listing);
  const clamp = (v: number) => Math.min(90, Math.max(10, v));
  return {
    left: `${clamp(50 + (east / spanMeters) * 100)}%`,
    top: `${clamp(50 - (north / spanMeters) * 100)}%`,
  };
}

type MapCanvasProps = {
  listings: Listing[];
  center: LatLng;
  /** « narrow » sous 900 px, « wide » pour la colonne de gauche. */
  variant: "narrow" | "wide";
  className?: string;
};

/**
 * Fond de carte décoratif : rues et bâtiments en formes CSS.
 * À remplacer par MapLibre GL et de vraies tuiles.
 */
export function MapCanvas({ listings, center, variant, className = "" }: MapCanvasProps) {
  const wide = variant === "wide";
  const span = wide ? 1800 : 1200;
  const pin = wide ? "h-[58px] w-[58px] shadow-pin-wide" : "h-[52px] w-[52px] shadow-pin";

  return (
    <div className={`bg-map relative overflow-hidden ${className}`}>
      {/* Rues */}
      <div className="bg-surface absolute top-[16%] -left-16 h-[26px] w-[1600px] rotate-[-5deg]" />
      <div className="bg-surface absolute top-[62%] -left-16 h-[22px] w-[1600px] rotate-[3deg]" />
      <div className="bg-surface absolute -top-10 left-[22%] h-[1400px] w-[24px] rotate-[8deg]" />
      <div className="bg-surface absolute -top-10 left-[62%] h-[1400px] w-[18px] rotate-[-5deg]" />
      {/* Bâtiments */}
      <div className="bg-building absolute top-[30%] left-[30%] h-[22%] w-[26%] rounded-xl" />
      <div className="bg-building absolute top-[44%] left-[6%] h-[18%] w-[18%] rounded-xl" />
      <div className="bg-building absolute top-[24%] left-[70%] h-[20%] w-[22%] rounded-xl" />

      {/* Objets déposés */}
      {listings.map((listing) => {
        const pos = project(center, listing, span);
        return (
          <div
            key={listing.id}
            className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={pos}
          >
            <span
              className={`border-brand text-ink flex items-center justify-center overflow-hidden rounded-full border-[3px] text-center font-mono text-[10px]/[1.1] font-bold ${pin} ${swatchClass(listing.category)}`}
            >
              {pinTag(listing.name)}
            </span>
            <span className="bg-brand -mt-1.5 h-2.5 w-2.5 rotate-45 rounded-[2px]" />
          </div>
        );
      })}

      {/* Position de l'utilisateur */}
      <div className="border-surface bg-you shadow-you absolute top-1/2 left-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]" />
    </div>
  );
}
