export const CATEGORIES = ["Meubles", "Électro", "Vélos", "Déco", "Literie", "Autre"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["Bon état", "Correct", "À réparer"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const FILTERS = ["Tout", "Meubles", "Vélos", "Électro", "Moins de 500 m"] as const;
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
  status: ListingStatus;
};

/** Classe de placeholder photo, en attendant les vraies photos des habitants. */
export function swatchClass(category: Category): string {
  switch (category) {
    case "Meubles":
      return "swatch-wood";
    case "Électro":
      return "swatch-appl";
    case "Vélos":
      return "swatch-bike";
    case "Déco":
      return "swatch-deco";
    case "Literie":
      return "swatch-bed";
    default:
      return "swatch-other";
  }
}
