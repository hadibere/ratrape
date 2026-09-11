type SavedCounterProps = {
  count: number;
  className?: string;
};

/** « 37 objets sauvés ce mois » : pilule dans l'en-tête, pastille flottante sur desktop. */
export function SavedCounter({ count, className = "" }: SavedCounterProps) {
  return (
    <div className={`flex w-fit items-center gap-2 rounded-full ${className}`}>
      <span className="bg-brand h-[9px] w-[9px] flex-none rounded-full" />
      <span className="font-display text-brand font-bold">{count} objets sauvés ce mois</span>
    </div>
  );
}
