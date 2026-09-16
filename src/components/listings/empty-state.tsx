type EmptyStateProps = {
  className?: string;
};

/**
 * Sans filtre, la liste ne peut être vide que pour une seule raison : personne
 * n'a rien déposé. Le message le dit, et invite à être le premier.
 */
export function EmptyState({ className = "" }: EmptyStateProps) {
  return (
    <div className={`border-line-disabled rounded-2xl border border-dashed p-5 ${className}`}>
      <p className="font-display text-ink text-[15px] font-bold">Le quartier est vide</p>
      <p className="text-muted mt-1.5 text-[13px]/[1.5]">
        Aucun encombrant n’est signalé pour le moment. Vous serez peut-être le premier à en déposer
        un.
      </p>
    </div>
  );
}
