"use client";

import { useNeighborhood } from "@/components/shell/neighborhood-context";

/**
 * Demande la position, à la main.
 *
 * Rien n'est réclamé à l'arrivée : l'habitant décide, une fois qu'il voit à
 * quoi ça sert. Le bouton disparaît dès que la position est obtenue.
 */
export function LocateButton({ className = "" }: { className?: string }) {
  const { geo, requestGeo } = useNeighborhood();
  if (geo === "granted") return null;

  const refused = geo === "denied" || geo === "unavailable";
  const label =
    geo === "pending" ? "Localisation…" : refused ? "Position refusée · réessayer" : "Me localiser";

  return (
    <button
      type="button"
      onClick={requestGeo}
      disabled={geo === "pending"}
      title={
        refused ? "Autorisez la localisation dans les réglages de votre navigateur" : undefined
      }
      className={`bg-surface text-ink font-display w-fit cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold disabled:cursor-default disabled:opacity-70 ${className}`}
    >
      <span className="bg-you mr-2 inline-block h-2 w-2 rounded-full align-middle" />
      {label}
    </button>
  );
}
