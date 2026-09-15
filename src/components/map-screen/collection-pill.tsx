"use client";

import { useState } from "react";
import {
  formatCollectionDay,
  formatEve,
  holidayOn,
  nextCollection,
  ZONE_DETAILS,
  ZONES,
} from "@/lib/collection";

/**
 * Prochaine collecte, réduite à une pilule.
 *
 * La date ne compte vraiment que deux soirs par mois : elle tient donc en trois
 * mots, et le détail des deux zones s'ouvre d'une tape pour qui en a besoin.
 */
export function CollectionPill() {
  const [open, setOpen] = useState(false);

  const collections = ZONES.map((zone) => ({ zone, date: nextCollection(zone) })).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const soonest = collections[0];
  const short = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
  }).format(soonest.date);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="bg-brand-soft text-brand flex-none cursor-pointer rounded-full px-3 py-1.5 text-[11.5px] font-bold"
      >
        Collecte {short}
      </button>

      {open ? (
        <div className="border-line-soft bg-card shadow-overlay absolute inset-x-0 top-full mt-1.5 rounded-2xl border p-3.5">
          {collections.map(({ zone, date }) => (
            <p key={zone} className="text-ink mt-0.5 text-[13px] font-semibold first:mt-0">
              {zone} · {formatCollectionDay(date).toLowerCase()}
              {holidayOn(date) ? (
                <span className="text-danger"> · jour férié, à confirmer</span>
              ) : null}
            </p>
          ))}
          <p className="text-muted mt-2 text-xs/[1.45]">
            Sortez vos encombrants {formatEve(soonest.date)}, jamais plus tôt.
          </p>
          <p className="text-muted mt-1.5 text-xs/[1.45]">
            {ZONES.map((zone) => `${zone} : ${ZONE_DETAILS[zone].sectors}`).join(" · ")}
          </p>
        </div>
      ) : null}
    </>
  );
}
