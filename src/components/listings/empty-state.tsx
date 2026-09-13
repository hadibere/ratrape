import type { Filter } from "@/lib/types";

type EmptyStateProps = {
  filter: Filter;
  /** Annonces en ligne toutes zones confondues, avant filtrage. */
  total: number;
  /** Distance du plus proche objet, quand il en existe hors du filtre. */
  nearestMeters: number | null;
  className?: string;
};

/**
 * Trois situations très différentes se ressemblent à l'écran : le quartier est
 * vide, le filtre est trop étroit, ou tout est simplement trop loin. Le message
 * doit dire laquelle.
 */
export function EmptyState({ filter, total, nearestMeters, className = "" }: EmptyStateProps) {
  const far = nearestMeters !== null && nearestMeters > 2000;

  const [title, message] =
    total === 0
      ? [
          "Le quartier est vide",
          "Aucun encombrant n’est signalé pour le moment. Vous serez peut-être le premier à en déposer un.",
        ]
      : far
        ? [
            "Rien près de vous",
            `L’objet le plus proche est à ${Math.round(nearestMeters / 100) / 10} km. Revenez plus tard, les dépôts se font souvent la veille du camion.`,
          ]
        : filter === "Tout"
          ? ["Rien à récupérer ici", "Aucun encombrant disponible dans cette zone pour l’instant."]
          : [
              "Aucun objet ne correspond",
              `Rien ne correspond au filtre « ${filter} ». Essayez « Tout » pour voir le reste du quartier.`,
            ];

  return (
    <div className={`border-line-disabled rounded-2xl border border-dashed p-5 ${className}`}>
      <p className="font-display text-ink text-[15px] font-bold">{title}</p>
      <p className="text-muted mt-1.5 text-[13px]/[1.5]">{message}</p>
    </div>
  );
}
