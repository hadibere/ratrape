/**
 * Le rat du nom, glissé entre « Rat » et « rape ».
 *
 * Dessiné en dur plutôt qu'importé : quelques centaines d'octets, il hérite de
 * la couleur du texte et reste net à toutes les tailles. La boîte est calée sur
 * le ventre de l'animal pour qu'il pose sur la ligne de base du mot.
 */
export function RatMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 20.4"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      {/* Queue : pleine et effilée, soudée à la croupe. */}
      <path d="M13 15.9 C 7 18.4, 2.2 15.8, 1.8 11.1 C 3.5 14.8, 7.4 16.7, 13 14.5 Z" />
      <ellipse cx="18" cy="14" rx="9.6" ry="5.8" />
      <circle cx="27.8" cy="12.8" r="5" />
      {/* Museau pointu : c'est lui qui distingue un rat d'une souris. */}
      <path
        d="M30.5 9.8 L38.6 13.1 L30.5 15.9 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="26.4" cy="8.4" r="2.5" />
      {/* L'œil est un trou dans la silhouette : il reprend le fond de la page. */}
      <circle cx="30.2" cy="12" r="0.82" fill="var(--color-surface)" />
    </svg>
  );
}
