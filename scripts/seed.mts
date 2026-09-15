/**
 * Remplit la base avec quelques encombrants de démonstration.
 *
 *   pnpm db:seed                  autour de la dernière annonce déposée,
 *                                 ou du centre par défaut si la base est vide
 *   pnpm db:seed 48.8566 2.3522   autour de ces coordonnées
 *   pnpm db:seed Saint-Denis     autour de ce lieu, cherché dans la Base
 *                                 Adresse Nationale
 *
 * Efface d'abord les annonces existantes : à ne pas lancer sur une base qui
 * sert vraiment.
 */
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";
import { nextCollection, type Zone } from "@/lib/collection";
import { DEFAULT_CENTER } from "@/lib/commune";
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
  /** Zone de collecte de la commune. */
  zone: Zone;
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
    zone: "Ville",
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
    zone: "Ville",
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
    zone: "Ville",
  },
  {
    id: "table-basse-verre",
    name: "Table basse en verre",
    category: "Déco",
    condition: "Correct",
    address: "8 rue Mozart",
    spot: "Angle du trottoir, plateau fêlé",
    dLat: -0.0045,
    dLng: -0.0041,
    postedMinutesAgo: 115,
    zone: "Parc",
  },
];

const db = getDb();

/** Cherche un lieu français par son nom, via la Base Adresse Nationale. */
async function geocode(query: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Service d'adresses indisponible (http ${response.status}).`);
    process.exit(1);
  }
  const data = (await response.json()) as {
    features?: { geometry: { coordinates: [number, number] }; properties: { label: string } }[];
  };
  const found = data.features?.[0];
  if (!found) return null;
  const [lng, lat] = found.geometry.coordinates;
  return { lat, lng, label: found.properties.label };
}

/**
 * Centre des annonces d'exemple, par ordre de priorité : les arguments de la
 * commande, puis la dernière annonce encore en ligne, puis le quartier par
 * défaut. Les annonces retirées ou récupérées sont ignorées, sinon les restes
 * d'un script de test décideraient de l'endroit.
 */
async function resolveCenter(): Promise<{ lat: number; lng: number; source: string }> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const [lat, lng] = args.map(Number);
  if (args.length >= 2 && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, source: "coordonnées passées en argument" };
  }

  if (args.length > 0) {
    const place = await geocode(args.join(" "));
    if (place) return { lat: place.lat, lng: place.lng, source: `lieu « ${place.label} »` };
    console.error(`Lieu « ${args.join(" ")} » introuvable.`);
    process.exit(1);
  }

  const [last] = await db
    .select({ lat: listings.lat, lng: listings.lng })
    .from(listings)
    .where(eq(listings.status, "available"))
    .orderBy(desc(listings.postedAt))
    .limit(1);
  if (last) return { ...last, source: "dernière annonce en ligne" };
  return { ...DEFAULT_CENTER, source: "centre par défaut" };
}

const center = await resolveCenter();
console.log(`Centre : ${center.source}`);

/**
 * L'amorçage ne détruit que ce qu'il a créé.
 *
 * Les exemples ont des identifiants fixes ; une annonce déposée par le
 * formulaire en reçoit un tiré au hasard. Tout ce qui n'est pas un exemple est
 * donc le dépôt de quelqu'un, et s'efface volontairement, jamais par habitude.
 */
const DEMO_IDS = new Set(SEEDS.map((seed) => seed.id));
const force = process.argv.slice(2).includes("--forcer");

const existing = await db.select().from(listings);
const foreign = existing.filter((row) => !DEMO_IDS.has(row.id));

if (foreign.length > 0 && !force) {
  console.error(`Refus : ${foreign.length} annonce(s) que l'amorçage n'a pas créées.`);
  for (const row of foreign) {
    const date = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(row.postedAt);
    console.error(
      `  ${row.id.padEnd(22)} · ${row.address.slice(0, 30).padEnd(30)} · déposée le ${date}`,
    );
  }
  console.error("Relancez avec --forcer pour les effacer quand même.");
  process.exit(1);
}

if (foreign.length > 0) {
  console.warn(`--forcer : ${foreign.length} annonce(s) réelle(s) vont être effacées.`);
}

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
    lat: center.lat + seed.dLat,
    lng: center.lng + seed.dLng,
    postedAt: new Date(Date.now() - seed.postedMinutesAgo * 60_000),
    pickupAt: nextCollection(seed.zone),
    zone: seed.zone,
    status: "available",
    manageTokenHash: hashToken(token),
  });
  console.log(`  ${seed.name.padEnd(20)} lien de gestion : ${token}`);
}

console.log(`${SEEDS.length} annonces insérées`);
process.exit(0);
