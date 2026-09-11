import "server-only";
import { nextWeekdayAt6 } from "@/lib/format";
import { DEFAULT_CENTER } from "@/lib/geo";
import { hashToken } from "@/lib/token";
import type { Category, Condition, Listing, PickupChoice } from "@/lib/types";

/**
 * Données en mémoire pour le développement et la démonstration.
 * Postgres (Supabase) prendra le relais sans changer ces signatures.
 */
type Row = Listing & { manageTokenHash: string; takenAt: string | null };

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

/** Compteur du mois avant les objets récupérés pendant la session. */
const SAVED_BASE = 36;

function fromSeed(seed: Seed): Row {
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
    manageTokenHash: "",
    takenAt: null,
  };
}

/** Les annonces publiées pendant la session s'ajoutent aux données d'exemple. */
const created: Map<string, Row> = ((
  globalThis as { __ratrapeCreated?: Map<string, Row> }
).__ratrapeCreated ??= new Map());

function allRows(): Row[] {
  return [...SEEDS.map(fromSeed), ...created.values()];
}

/** Vue publique : le jeton de gestion et la date de récupération ne sortent pas. */
function publicView(row: Row): Listing {
  const listing: Listing = {
    id: row.id,
    photoUrl: row.photoUrl,
    name: row.name,
    category: row.category,
    condition: row.condition,
    address: row.address,
    spot: row.spot,
    lat: row.lat,
    lng: row.lng,
    postedAt: row.postedAt,
    pickupAt: row.pickupAt,
    status: row.status,
  };
  return listing;
}

/** Annonces encore sur le trottoir, camion pas encore passé, plus récentes d'abord. */
export async function getAvailableListings(): Promise<Listing[]> {
  const now = Date.now();
  return allRows()
    .filter((row) => row.status === "available")
    .filter((row) => !row.pickupAt || Date.parse(row.pickupAt) > now)
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
    .map(publicView);
}

export async function getListing(id: string): Promise<Listing | null> {
  const row = allRows().find((r) => r.id === id);
  return row ? publicView(row) : null;
}

export async function getListingByToken(token: string): Promise<Listing | null> {
  const hash = hashToken(token);
  const row = allRows().find((r) => r.manageTokenHash && r.manageTokenHash === hash);
  return row ? publicView(row) : null;
}

/** Compteur affiché sur la carte : « 37 objets sauvés ce mois ». */
export async function getSavedThisMonth(): Promise<number> {
  const month = new Date().toISOString().slice(0, 7);
  const taken = allRows().filter((r) => r.takenAt?.startsWith(month)).length;
  return SAVED_BASE + 1 + taken;
}

export type NewListing = {
  category: Category;
  condition: Condition;
  address: string;
  spot: string;
  lat: number;
  lng: number;
  pickup: PickupChoice;
  manageToken: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

export async function createListing(input: NewListing): Promise<Listing> {
  const pickupAt =
    input.pickup === "Jeudi"
      ? nextWeekdayAt6(4).toISOString()
      : input.pickup === "Vendredi"
        ? nextWeekdayAt6(5).toISOString()
        : "";

  const id = `${slugify(input.category)}-${Math.random().toString(36).slice(2, 8)}`;
  const row: Row = {
    id,
    photoUrl: null,
    name: input.category,
    category: input.category,
    condition: input.condition,
    address: input.address,
    spot: input.spot || null,
    lat: input.lat,
    lng: input.lng,
    postedAt: new Date().toISOString(),
    pickupAt,
    status: "available",
    manageTokenHash: hashToken(input.manageToken),
    takenAt: null,
  };
  created.set(id, row);
  return publicView(row);
}
