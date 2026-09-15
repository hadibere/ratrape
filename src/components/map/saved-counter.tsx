type SavedCounterProps = {
  count: number;
  className?: string;
};

/**
 * Compteur des objets récupérés ce mois-ci.
 *
 * Rien ne s'affiche tant qu'aucun objet n'a été sauvé : un compteur à zéro
 * n'apprend rien et occupe la place. Il apparaît à la première récupération,
 * quand il devient une vraie preuve que le quartier s'en sert.
 */
export function SavedCounter({ count, className = "" }: SavedCounterProps) {
  if (count === 0) return null;

  return (
    <div className={`flex w-fit items-center gap-2 rounded-full ${className}`}>
      <span className="bg-brand h-[9px] w-[9px] flex-none rounded-full" />
      <span className="font-display text-brand font-bold">
        {count} objet{count > 1 ? "s" : ""} sauvé{count > 1 ? "s" : ""} ce mois
      </span>
    </div>
  );
}
