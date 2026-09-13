import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as {
  __ratrapeSql?: ReturnType<typeof postgres>;
  __ratrapeDb?: Db;
};

/**
 * Connexion créée au premier usage, puis réutilisée pour tout le processus et
 * conservée entre les rechargements à chaud du serveur de développement.
 *
 * L'ouverture est différée pour qu'importer ce module n'échoue pas quand
 * DATABASE_URL est absent : seule une requête réelle doit alors se plaindre.
 *
 * `prepare: false` est imposé par le pooler de Supabase en mode transaction,
 * qui ne garantit pas qu'une requête préparée revienne sur la même session.
 */
export function getDb(): Db {
  if (globalForDb.__ratrapeDb) return globalForDb.__ratrapeDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL manquant. Copiez .env.example vers .env.local et collez la chaîne " +
        "de connexion Supabase (bouton Connect, méthode « Transaction pooler »).",
    );
  }

  const sql = (globalForDb.__ratrapeSql ??= postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
  }));

  globalForDb.__ratrapeDb = drizzle(sql, { schema });
  return globalForDb.__ratrapeDb;
}
