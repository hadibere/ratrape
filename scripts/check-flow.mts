/** Vérifie le parcours complet contre la vraie base. `pnpm db:flow` */
import {
  createListing,
  getAvailableListings,
  getListing,
  getListingByToken,
  getSavedThisMonth,
  markTaken,
  removeByToken,
} from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const before = await getAvailableListings();
const savedBefore = await getSavedThisMonth();
ok(`${before.length} annonces d'exemple lues`, before.length === 4);
ok("triées de la plus récente à la plus ancienne", before[0].name === "Canapé 2 places");
ok("aucun jeton dans les données publiques", !("manageTokenHash" in (before[0] as object)));

const token = generateToken();
const created = await createListing({
  category: "Literie",
  condition: "Correct",
  address: "1 rue du Test",
  spot: "",
  lat: 43.6,
  lng: 3.88,
  pickup: "Je ne sais pas",
  manageToken: token,
});
ok("annonce créée", Boolean(created.id));
ok("date de passage vide quand l'habitant ne sait pas", created.pickupAt === "");

const after = await getAvailableListings();
ok(
  "visible sur la carte",
  after.some((l) => l.id === created.id),
);
ok("retrouvée par son jeton", (await getListingByToken(token))?.id === created.id);
ok("introuvable avec un mauvais jeton", (await getListingByToken("AAA-BBB")) === null);
ok(
  "fiche lisible par son identifiant",
  (await getListing(created.id))?.address === "1 rue du Test",
);

ok("« je l'ai pris » accepté une fois", await markTaken(created.id));
ok("refusé la seconde fois", !(await markTaken(created.id)));
ok("retirée de la carte", !(await getAvailableListings()).some((l) => l.id === created.id));
ok("compteur mensuel incrémenté", (await getSavedThisMonth()) === savedBefore + 1);

const second = generateToken();
const toRemove = await createListing({
  category: "Déco",
  condition: "Bon état",
  address: "2 rue du Test",
  spot: "",
  lat: 43.6,
  lng: 3.88,
  pickup: "Jeudi",
  manageToken: second,
});
ok("retrait par le lien de gestion", await removeByToken(second));
ok(
  "disparue de la carte sans compter comme sauvée",
  !(await getAvailableListings()).some((l) => l.id === toRemove.id) &&
    (await getSavedThisMonth()) === savedBefore + 1,
);

console.log("\nNettoyage : relancez `pnpm db:seed` pour repartir des 4 annonces d'exemple.");
process.exit(0);
