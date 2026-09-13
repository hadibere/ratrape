/** Vérifie les situations limites contre la vraie base. `pnpm db:states` */
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";
import {
  createListing,
  getAvailableListings,
  getListing,
  markTakenByToken,
  removeByToken,
} from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const make = async (address: string) =>
  createListing({
    category: "Meubles", condition: "Correct", address, spot: "",
    lat: 48.94, lng: 2.15, pickup: "Jeudi", manageToken: generateToken(),
  });

// Camion passé : l'annonce est présentée comme ramassée, sans que personne ne l'ait signalé.
const past = await make("1 rue du Passé");
await getDb()
  .update(listings)
  .set({ pickupAt: new Date(Date.now() - 3 * 3600_000) })
  .where(eq(listings.id, past.id));
const expired = await getListing(past.id);
ok("camion passé : statut « collected »", expired?.status === "collected");
ok("camion passé : absente de la carte", !(await getAvailableListings()).some((l) => l.id === past.id));

// Date de passage inconnue : l'annonce reste visible tant que personne ne la retire.
const unknown = await createListing({
  category: "Déco", condition: "Bon état", address: "2 rue Sans Date", spot: "",
  lat: 48.94, lng: 2.15, pickup: "Je ne sais pas", manageToken: generateToken(),
});
ok("sans date de collecte : statut inchangé", (await getListing(unknown.id))?.status === "available");
ok("sans date de collecte : visible sur la carte",
  (await getAvailableListings()).some((l) => l.id === unknown.id));

// Objet récupéré puis annonce retirée : deux situations distinctes.
const takenToken = generateToken();
const taken = await createListing({
  category: "Vélos", condition: "Bon état", address: "3 rue Prise", spot: "",
  lat: 48.94, lng: 2.15, pickup: "Jeudi", manageToken: takenToken,
});
await markTakenByToken(takenToken);
ok("objet pris : statut « taken »", (await getListing(taken.id))?.status === "taken");

const removedToken = generateToken();
const removed = await createListing({
  category: "Literie", condition: "Correct", address: "4 rue Retirée", spot: "",
  lat: 48.94, lng: 2.15, pickup: "Jeudi", manageToken: removedToken,
});
await removeByToken(removedToken);
ok("annonce retirée : statut « removed »", (await getListing(removed.id))?.status === "removed");

ok("identifiant inconnu : rien", (await getListing("objet-qui-n-existe-pas")) === null);

// Ménage : ces annonces de test ne doivent pas rester en base.
for (const id of [past.id, unknown.id, taken.id, removed.id]) {
  await getDb().delete(listings).where(eq(listings.id, id));
}
console.log("\nAnnonces de test supprimées.");
process.exit(0);
