import { doublePrecision, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Les colonnes de catégorie, d'état et de statut sont du texte simple plutôt que
 * des types énumérés Postgres : ajouter une catégorie ne demandera pas de
 * migration, et la validation se fait déjà à l'entrée avec Zod.
 */
export const listings = pgTable(
  "listings",
  {
    id: text("id").primaryKey(),
    photoUrl: text("photo_url"),
    name: text("name").notNull(),
    category: text("category").notNull(),
    condition: text("condition").notNull(),
    address: text("address").notNull(),
    spot: text("spot"),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
    /** Passage du camion, calculé depuis la zone au moment du dépôt. */
    pickupAt: timestamp("pickup_at", { withTimezone: true }),
    /** Zone de collecte de la commune ; nulle pour les annonces d'avant ce champ. */
    zone: text("zone"),
    status: text("status").notNull().default("available"),
    /** Empreinte SHA-256 du jeton de gestion : le jeton lui-même n'est jamais stocké. */
    manageTokenHash: text("manage_token_hash").notNull().unique(),
    /** Renseigné quand un voisin déclare avoir pris l'objet : trace de ce qui a été sauvé. */
    takenAt: timestamp("taken_at", { withTimezone: true }),
  },
  (table) => [
    // La carte ne lit que les annonces disponibles dont le camion n'est pas passé.
    index("listings_status_pickup_idx").on(table.status, table.pickupAt),
    index("listings_taken_at_idx").on(table.takenAt),
  ],
);

export type ListingRow = typeof listings.$inferSelect;
export type NewListingRow = typeof listings.$inferInsert;
