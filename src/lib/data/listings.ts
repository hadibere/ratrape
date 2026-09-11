import "server-only";
import { nextWeekdayAt6 } from "@/lib/format";
import { DEFAULT_CENTER } from "@/lib/geo";
import type { Category, Condition, Listing } from "@/lib/types";

/**
 * Données de démonstration en mémoire. Elles seront remplacées par Postgres
 * (Supabase) sans changer la signature de ces fonctions.
 */
type Seed = {
  id: string;
  name: string;
  category: Category;
  condition: Condition;
  address: string;
  spot: string;
  /** Décalage en degrés par rapport au centre du quartier. */
  dLat: number;
  dLng: number;
  /** Ancienneté du dépôt, en minutes. */
  postedMinutesAgo: number;
  /** Jour de passage du camion (4 = jeudi, 5 = vendredi). */
  pickupWeekday: number;
};

const SEEDS: Seed[] = [
  {
    id: "canape-2-places",
    name: "Canapé 2 places",
    category: "Meubles",
    condition: "Bon état",
    address: "14 rue des Lilas",
    spot: "Devant le portail vert, côté pair",
    dLat: 0.0008,
    dLng: 0.001,
    postedMinutesAgo: 35,
    pickupWeekday: 4,
  },
  {
    id: "commode-en-pin",
    name: "Commode en pin",
    category: "Meubles",
    condition: "Correct",
    address: "3 place Carnot",
    spot: "Près de l'abribus, un tiroir abîmé",
    dLat: -0.0018,
    dLng: 0.00278,
    postedMinutesAgo: 70,
    pickupWeekday: 4,
  },
  {
    id: "velo-enfant-16",
    name: 'Vélo enfant 16"',
    category: "Vélos",
    condition: "Bon état",
    address: "27 av. Jean Jaurès",
    spot: "Contre le muret du square",
    dLat: 0.003,
    dLng: -0.0037,
    postedMinutesAgo: 900,
    pickupWeekday: 4,
  },
  {
    id: "lave-linge-hublot",
    name: "Lave-linge hublot",
    category: "Électro",
    condition: "À réparer",
    address: "8 rue Mozart",
    spot: "Angle du trottoir, ne fuit pas",
    dLat: -0.0045,
    dLng: -0.0041,
    postedMinutesAgo: 115,
    pickupWeekday: 5,
  },
];

/** Compteur du mois avant les objets réellement récupérés dans cette session. */
const SAVED_BASE = 36;

function build(seed: Seed): Listing {
  return {
    id: seed.id,
    photoUrl: null,
    name: seed.name,
    category: seed.category,
    condition: seed.condition,
    address: seed.address,
    spot: seed.spot,
    lat: DEFAULT_CENTER.lat + seed.dLat,
    lng: DEFAULT_CENTER.lng + seed.dLng,
    postedAt: new Date(Date.now() - seed.postedMinutesAgo * 60_000).toISOString(),
    pickupAt: nextWeekdayAt6(seed.pickupWeekday).toISOString(),
    status: "available",
  };
}

/** Annonces encore sur le trottoir, camion pas encore passé, plus récentes d'abord. */
export async function getAvailableListings(): Promise<Listing[]> {
  const now = Date.now();
  return SEEDS.map(build)
    .filter((l) => l.status === "available" && Date.parse(l.pickupAt) > now)
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
}

export async function getListing(id: string): Promise<Listing | null> {
  const seed = SEEDS.find((s) => s.id === id);
  return seed ? build(seed) : null;
}

/** Compteur affiché sur la carte : « 37 objets sauvés ce mois ». */
export async function getSavedThisMonth(): Promise<number> {
  return SAVED_BASE + 1;
}
