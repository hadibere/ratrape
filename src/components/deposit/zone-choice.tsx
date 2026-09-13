"use client";

import { ChoiceButtons } from "@/components/deposit/choice-buttons";
import {
  formatCollectionDay,
  formatEve,
  holidayWarning,
  nextCollection,
  ZONE_DETAILS,
  ZONES,
  type Zone,
} from "@/lib/collection";

/**
 * La date de collecte se déduit de la zone, que l'application ne peut pas
 * deviner : les limites des secteurs ne sont pas publiées. On la demande donc,
 * et on affiche aussitôt la date obtenue pour que le choix se vérifie tout seul.
 */
export function ZoneChoice({ value, onChange }: { value: Zone; onChange: (zone: Zone) => void }) {
  const collection = nextCollection(value);
  const warning = holidayWarning(collection);

  return (
    <>
      <ChoiceButtons options={ZONES} value={value} onChange={onChange} layout="blocks" />
      <p className="text-muted mt-2 text-xs/[1.45]">
        {ZONES.map((zone) => `${zone} : ${ZONE_DETAILS[zone].sectors}`).join(" · ")}
      </p>
      <p className="bg-notice text-notice-ink mt-2.5 rounded-2xl px-3.5 py-3 text-[13px]/[1.45] font-semibold">
        Prochaine collecte {formatCollectionDay(collection).toLowerCase()}. Sortez l’objet{" "}
        {formatEve(collection)}.
        {warning ? <span className="text-danger block pt-1.5">{warning}</span> : null}
      </p>
    </>
  );
}
