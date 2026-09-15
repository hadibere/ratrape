/** Vérifie que le compteur ne compte que des objets réellement récupérés. `pnpm db:counter` */
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";
import { createListing, getSavedThisMonth, markTaken, removeByToken } from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const make = async (address: string, token: string) =>
  createListing({
    category: "Meubles",
    condition: "Correct",
    address,
    spot: "",
    lat: 48.9489,
    lng: 2.1449,
    zone: "Ville",
    manageToken: token,
  });

const start = await getSavedThisMonth();
console.log("     compteur au départ :", start);

const posted = await make("1 rue du Compteur", generateToken());
ok("publier ne compte pas", (await getSavedThisMonth()) === start);

await markTaken(posted.id);
ok("récupérer compte", (await getSavedThisMonth()) === start + 1);

await markTaken(posted.id);
ok("récupérer deux fois ne compte qu'une", (await getSavedThisMonth()) === start + 1);

const removedToken = generateToken();
const removed = await make("2 rue du Compteur", removedToken);
await removeByToken(removedToken);
ok("retirer ne compte pas", (await getSavedThisMonth()) === start + 1);

// Une récupération du mois dernier ne doit plus apparaître.
const old = await make("3 rue du Compteur", generateToken());
await markTaken(old.id);
await getDb()
  .update(listings)
  .set({ takenAt: new Date(Date.now() - 40 * 24 * 3600 * 1000) })
  .where(eq(listings.id, old.id));
ok("le mois dernier ne compte plus", (await getSavedThisMonth()) === start + 1);

for (const id of [posted.id, removed.id, old.id]) {
  await getDb().delete(listings).where(eq(listings.id, id));
}
ok("compteur revenu à son point de départ", (await getSavedThisMonth()) === start);
process.exit(0);
