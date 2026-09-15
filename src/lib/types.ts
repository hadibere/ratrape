import type { Zone } from "@/lib/collection";

/**
 * « Électro » a été retirée : à Maisons-Laffitte, l'électroménager et
 * l'électronique ne sont pas ramassés avec les encombrants, les proposer
 * reviendrait à encourager un dépôt sauvage.
 */
export const CATEGORIES = ["Meubles", "Vélos", "Déco", "Literie", "Autre"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["Bon état", "Correct", "À réparer"] as const;
export type Condition = (typeof CONDITIONS)[number];

/**
 * Filtres de la carte, dérivés des catégories : une catégorie ajoutée devient
 * filtrable sans rien changer ici, et aucune ne peut être oubliée.
 */
export const FILTERS = ["Tout", ...CATEGORIES] as const;
export type Filter = (typeof FILTERS)[number];

export type ListingStatus = "available" | "taken" | "collected" | "removed";

export type Listing = {
  id: string;
  photoUrl: string | null;
  name: string;
  category: Category;
  condition: Condition;
  address: string;
  spot: string | null;
  lat: number;
  lng: number;
  postedAt: string; // ISO
  pickupAt: string; // ISO — passage du camion
  /** Zone de collecte choisie au dépôt ; null pour les annonces d'avant. */
  zone: Zone | null;
  status: ListingStatus;
};

/** Article et libellé au singulier, pour la phrase de confirmation. */
export const CATEGORY_PHRASE: Record<Category, { article: "le" | "la"; label: string }> = {
  Meubles: { article: "le", label: "meuble" },
  Vélos: { article: "le", label: "vélo" },
  Déco: { article: "le", label: "objet de déco" },
  Literie: { article: "la", label: "literie" },
  Autre: { article: "le", label: "objet" },
};
