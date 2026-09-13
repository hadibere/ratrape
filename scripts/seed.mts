/**
 * Remplit la base avec quelques encombrants de démonstration autour du centre
 * du quartier. Lancer avec `pnpm db:seed`. Efface d'abord les annonces
 * existantes : à ne pas lancer sur une base qui sert vraiment.
 */
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";
import { nextWeekdayAt6 } from "@/lib/format";
import { DEFAULT_CENTER } from "@/lib/geo";
import { generateToken, hashToken } from "@/lib/token";
import type { Category, Condition } from "@/lib/types";

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

const db = getDb();

const removed = await db.delete(listings).returning({ id: listings.id });
console.log(`${removed.length} annonce(s) effacée(s)`);

for (const seed of SEEDS) {
  const token = generateToken();
  await db.insert(listings).values({
    id: seed.id,
    photoUrl: null,
    name: seed.name,
    category: seed.category,
    condition: seed.condition,
    address: seed.address,
    spot: seed.spot,
    lat: DEFAULT_CENTER.lat + seed.dLat,
    lng: DEFAULT_CENTER.lng + seed.dLng,
    postedAt: new Date(Date.now() - seed.postedMinutesAgo * 60_000),
    pickupAt: nextWeekdayAt6(seed.pickupWeekday),
    status: "available",
    manageTokenHash: hashToken(token),
  });
  console.log(`  ${seed.name.padEnd(20)} lien de gestion : ${token}`);
}

console.log(`${SEEDS.length} annonces insérées`);
process.exit(0);
