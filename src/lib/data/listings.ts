import "server-only";
import { and, count, desc, eq, gt, gte, isNull, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings, type ListingRow } from "@/db/schema";
import { nextWeekdayAt6 } from "@/lib/format";
import { hashToken } from "@/lib/token";
import type { Category, Condition, Listing, PickupChoice } from "@/lib/types";

/**
 * Compteur du mois avant les objets récupérés via l'application.
 * Le quartier n'a pas attendu Ratrape pour sauver des encombrants.
 */
const SAVED_BASE = 36;

/**
 * Vue publique : ni l'empreinte du jeton, ni la date de récupération, ne sortent
 * d'ici. Une annonce dont le camion est passé est présentée comme ramassée,
 * même si personne n'a pensé à le signaler.
 */
function publicView(row: ListingRow): Listing {
  const collected =
    row.status === "available" && row.pickupAt !== null && row.pickupAt.getTime() < Date.now();
  return {
    id: row.id,
    photoUrl: row.photoUrl,
    name: row.name,
    category: row.category as Category,
    condition: row.condition as Condition,
    address: row.address,
    spot: row.spot,
    lat: row.lat,
    lng: row.lng,
    postedAt: row.postedAt.toISOString(),
    pickupAt: row.pickupAt ? row.pickupAt.toISOString() : "",
    status: collected ? "collected" : (row.status as Listing["status"]),
  };
}

/** Annonces encore sur le trottoir, camion pas encore passé, plus récentes d'abord. */
export async function getAvailableListings(): Promise<Listing[]> {
  const rows = await getDb()
    .select()
    .from(listings)
    .where(
      and(
        eq(listings.status, "available"),
        // Une date de passage inconnue reste visible : c'est l'habitant qui l'ignore.
        or(isNull(listings.pickupAt), gt(listings.pickupAt, new Date())),
      ),
    )
    .orderBy(desc(listings.postedAt));
  return rows.map(publicView);
}

export async function getListing(id: string): Promise<Listing | null> {
  const [row] = await getDb().select().from(listings).where(eq(listings.id, id)).limit(1);
  return row ? publicView(row) : null;
}

export async function getListingByToken(token: string): Promise<Listing | null> {
  const [row] = await getDb()
    .select()
    .from(listings)
    .where(eq(listings.manageTokenHash, hashToken(token)))
    .limit(1);
  return row ? publicView(row) : null;
}

/** Compteur affiché sur la carte : « 37 objets sauvés ce mois ». */
export async function getSavedThisMonth(): Promise<number> {
  const firstOfMonth = new Date();
  firstOfMonth.setUTCDate(1);
  firstOfMonth.setUTCHours(0, 0, 0, 0);

  const [row] = await getDb()
    .select({ total: count() })
    .from(listings)
    .where(gte(listings.takenAt, firstOfMonth));
  return SAVED_BASE + (row?.total ?? 0);
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

/** Jeudi et vendredi sont les seuls choix du formulaire ; « Je ne sais pas » laisse la date vide. */
function pickupDate(choice: PickupChoice): Date | null {
  if (choice === "Jeudi") return nextWeekdayAt6(4);
  if (choice === "Vendredi") return nextWeekdayAt6(5);
  return null;
}

export async function createListing(input: NewListing): Promise<Listing> {
  const id = `${slugify(input.category) || "objet"}-${Math.random().toString(36).slice(2, 8)}`;
  const [row] = await getDb()
    .insert(listings)
    .values({
      id,
      photoUrl: null,
      name: input.category,
      category: input.category,
      condition: input.condition,
      address: input.address,
      spot: input.spot || null,
      lat: input.lat,
      lng: input.lng,
      pickupAt: pickupDate(input.pickup),
      status: "available",
      manageTokenHash: hashToken(input.manageToken),
    })
    .returning();
  return publicView(row);
}

/** Un voisin déclare avoir pris l'objet : l'annonce quitte la carte et le compteur monte. */
export async function markTaken(id: string): Promise<boolean> {
  const updated = await getDb()
    .update(listings)
    .set({ status: "taken", takenAt: new Date() })
    .where(and(eq(listings.id, id), eq(listings.status, "available")))
    .returning({ id: listings.id });
  return updated.length > 0;
}

/**
 * Retrait par le lien de gestion : l'annonce disparaît sans compter comme
 * sauvée. Renvoie son identifiant pour que l'appelant efface aussi les photos.
 */
export async function removeByToken(token: string): Promise<string | null> {
  const [removed] = await getDb()
    .update(listings)
    .set({ status: "removed", photoUrl: null })
    .where(eq(listings.manageTokenHash, hashToken(token)))
    .returning({ id: listings.id });
  return removed?.id ?? null;
}

/** Le déposant signale lui-même que l'objet est parti. */
export async function markTakenByToken(token: string): Promise<string | null> {
  const [taken] = await getDb()
    .update(listings)
    .set({ status: "taken", takenAt: new Date() })
    .where(and(eq(listings.manageTokenHash, hashToken(token)), eq(listings.status, "available")))
    .returning({ id: listings.id });
  return taken?.id ?? null;
}

export type ListingEdit = {
  condition: Condition;
  pickup: PickupChoice;
  spot: string;
};

/** Seuls ces trois champs changent après coup ; le reste demande un nouveau dépôt. */
export async function updateByToken(token: string, edit: ListingEdit): Promise<string | null> {
  const [updated] = await getDb()
    .update(listings)
    .set({
      condition: edit.condition,
      pickupAt: pickupDate(edit.pickup),
      spot: edit.spot || null,
    })
    .where(and(eq(listings.manageTokenHash, hashToken(token)), eq(listings.status, "available")))
    .returning({ id: listings.id });
  return updated?.id ?? null;
}

/** Renseigne l'adresse de la photo une fois l'envoi au stockage réussi. */
export async function setPhotoUrl(id: string, photoUrl: string): Promise<void> {
  await getDb().update(listings).set({ photoUrl }).where(eq(listings.id, id));
}
