import { formatCollectionDay, formatEve, holidayOn, nextCollection, ZONES } from "@/lib/collection";

/**
 * À Maisons-Laffitte la collecte est mensuelle, et les objets ne sortent que la
 * veille au soir : la carte ne se remplit vraiment que deux nuits par mois.
 * Autant annoncer quand, plutôt que de laisser croire à un service permanent.
 */
export function CollectionBanner({ className = "" }: { className?: string }) {
  const next = ZONES.map((zone) => ({ zone, date: nextCollection(zone) })).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return (
    <div className={`border-line bg-card rounded-2xl border px-3.5 py-3 ${className}`}>
      <p className="text-label text-[11px] font-semibold tracking-[0.06em] uppercase">
        Prochaines collectes
      </p>
      {next.map(({ zone, date }) => (
        <p key={zone} className="text-ink mt-1 text-[13px] font-semibold">
          {zone} · {formatCollectionDay(date).toLowerCase()}
          {holidayOn(date) ? (
            <span className="text-danger font-semibold"> · jour férié, à confirmer</span>
          ) : null}
        </p>
      ))}
      <p className="text-muted mt-1.5 text-xs/[1.45]">
        Sortez vos encombrants {formatEve(next[0].date)}, jamais plus tôt.
      </p>
    </div>
  );
}
