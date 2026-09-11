type EmptyStateProps = {
  filter: string;
  className?: string;
};

export function EmptyState({ filter, className = "" }: EmptyStateProps) {
  return (
    <div className={`border-line-disabled rounded-2xl border border-dashed p-5 ${className}`}>
      <p className="font-display text-ink text-[15px] font-bold">Rien à récupérer ici</p>
      <p className="text-muted mt-1.5 text-[13px]/[1.5]">
        {filter === "Tout"
          ? "Aucun encombrant signalé dans le quartier pour le moment."
          : `Aucun objet ne correspond au filtre « ${filter} ».`}
      </p>
    </div>
  );
}
