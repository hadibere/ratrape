type SavedCounterProps = {
  count: number;
  className?: string;
};

/**
 * Compteur des objets récupérés ce mois-ci.
 *
 * À zéro, il n'affiche pas « 0 objets sauvés » : un chiffre nul décourage et
 * n'apprend rien. Il invite à ouvrir le compteur, ce qui reste vrai.
 */
export function SavedCounter({ count, className = "" }: SavedCounterProps) {
  const label =
    count === 0
      ? "Premier objet à sauver ce mois"
      : `${count} objet${count > 1 ? "s" : ""} sauvé${count > 1 ? "s" : ""} ce mois`;

  return (
    <div className={`flex w-fit items-center gap-2 rounded-full ${className}`}>
      <span className="bg-brand h-[9px] w-[9px] flex-none rounded-full" />
      <span className="font-display text-brand font-bold">{label}</span>
    </div>
  );
}
