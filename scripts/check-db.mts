/**
 * Vérifie que la base répond et que le schéma attendu est en place.
 * Lancer avec `pnpm db:check`. N'affiche aucun identifiant.
 */
import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";

const columns = await getDb().execute<{
  column_name: string;
  data_type: string;
  is_nullable: string;
}>(sql`
  select column_name, data_type, is_nullable
  from information_schema.columns
  where table_name = 'listings'
  order by ordinal_position`);

if (columns.length === 0) {
  console.error("Table « listings » absente. Lancez `pnpm db:migrate`.");
  process.exit(1);
}

console.log(`Table « listings » : ${columns.length} colonnes`);
for (const c of columns) {
  console.log(
    `  ${c.column_name.padEnd(18)} ${c.data_type}${c.is_nullable === "YES" ? " (nullable)" : ""}`,
  );
}

const indexes = await getDb().execute<{ indexname: string }>(
  sql`select indexname from pg_indexes where tablename = 'listings' order by indexname`,
);
console.log("Index :", indexes.map((row) => row.indexname).join(", "));

const [{ total }] = await getDb()
  .select({ total: sql<number>`count(*)::int` })
  .from(listings);
console.log("Lignes :", total);

process.exit(0);
