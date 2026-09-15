import type { Category } from "@/lib/types";

/**
 * Icônes des catégories, pour les annonces sans photo.
 *
 * Dessinées pour tenir dans une pastille de carte d'une trentaine de pixels :
 * une seule idée par icône, pas de détail qui disparaîtrait à cette taille.
 * Elles héritent de la couleur du texte.
 */
const OUTLINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const SHAPES: Record<Category, React.ReactNode> = {
  // Fauteuil de face : accoudoirs et pieds suffisent à dire « meuble ».
  Meubles: (
    <>
      <rect x="5" y="4.5" width="14" height="9.5" rx="3" />
      <rect x="2.5" y="9" width="3.6" height="7.5" rx="1.8" />
      <rect x="17.9" y="9" width="3.6" height="7.5" rx="1.8" />
      <rect x="4" y="12.5" width="16" height="4.6" rx="1.6" />
      <rect x="5" y="17" width="2" height="3" rx="0.9" />
      <rect x="17" y="17" width="2" height="3" rx="0.9" />
    </>
  ),
  Vélos: (
    <g {...OUTLINE} strokeWidth={1.7}>
      <circle cx="6" cy="16" r="4.6" />
      <circle cx="18" cy="16" r="4.6" />
      <path d="M6 16 L10.5 8.5 L15 16 M10.5 8.5 L15.5 8.5 M15.5 8.5 L18 16 M9 8.5 L12 8.5 M15.8 7 L17.4 7" />
    </g>
  ),
  // Lampe de chevet : l'objet de décoration le plus reconnaissable en silhouette.
  Déco: (
    <>
      <path d="M7.5 3.5 L16.5 3.5 L19 10.5 L5 10.5 Z" />
      <rect x="11" y="10.5" width="2" height="7.5" />
      <rect x="7" y="17.8" width="10" height="2.4" rx="1.2" />
    </>
  ),
  // Matelas vu de dessus, capitons compris : rempli, il se confondait avec le fauteuil.
  Literie: (
    <g {...OUTLINE}>
      <rect x="2.6" y="7" width="18.8" height="10.4" rx="3" />
      <path d="M7.2 10.4 L7.2 14 M12 10.4 L12 14 M16.8 10.4 L16.8 14" />
    </g>
  ),
  // Carton : en aplat il ressemblait à une maison, il lui faut ses arêtes.
  Autre: (
    <g {...OUTLINE}>
      <path d="M3.2 8.6 L12 4.4 L20.8 8.6 L20.8 19.6 L3.2 19.6 Z" />
      <path d="M12 4.4 L12 19.6 M3.2 8.6 L20.8 8.6" />
    </g>
  ),
};

export function CategoryIcon({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      {SHAPES[category]}
    </svg>
  );
}
