"use client";

import { useState } from "react";
import { LocationHelp } from "@/components/map-screen/location-help";
import { useNeighborhood } from "@/components/shell/neighborhood-context";

/**
 * Demande la position, à la main.
 *
 * Rien n'est réclamé à l'arrivée : l'habitant décide, une fois qu'il voit à
 * quoi ça sert. Après un refus, le bouton n'insiste pas, il explique.
 */
export function LocateButton({ className = "" }: { className?: string }) {
  const { geo, requestGeo } = useNeighborhood();
  const [open, setOpen] = useState(false);

  if (geo === "granted") return null;

  const refused = geo === "denied" || geo === "unavailable";

  if (refused) {
    return (
      <div className={`w-fit max-w-full ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="bg-surface text-notice-ink font-display cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold"
        >
          Position refusée · comment faire
        </button>
        {open ? (
          <div className="bg-surface shadow-overlay text-muted mt-1.5 rounded-2xl p-3.5">
            <LocationHelp />
            <p className="text-muted mt-1.5 text-[12px]/[1.45]">
              Vous pouvez aussi déposer un objet sans position : le formulaire permet de saisir
              votre adresse.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={requestGeo}
      disabled={geo === "pending"}
      className={`bg-surface text-ink font-display w-fit cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold disabled:cursor-default disabled:opacity-70 ${className}`}
    >
      <span className="bg-you mr-2 inline-block h-2 w-2 rounded-full align-middle" />
      {geo === "pending" ? "Localisation…" : "Me localiser"}
    </button>
  );
}
