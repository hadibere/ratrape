/** Vérifie la déclaration « je l'ai pris » de bout en bout. `pnpm db:taken` */
import {
  createListing,
  getAvailableListings,
  getSavedThisMonth,
  markTaken,
} from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const savedBefore = await getSavedThisMonth();
const listing = await createListing({
  category: "Vélos",
  condition: "Bon état",
  address: "9 rue du Test",
  spot: "",
  lat: 48.9489,
  lng: 2.1449,
  zone: "Ville",
  manageToken: generateToken(),
});

ok(
  "visible avant récupération",
  (await getAvailableListings()).some((l) => l.id === listing.id),
);
ok("première déclaration acceptée", await markTaken(listing.id));
ok("compteur du mois +1", (await getSavedThisMonth()) === savedBefore + 1);
ok("deuxième déclaration refusée", !(await markTaken(listing.id)));
ok("compteur inchangé après le refus", (await getSavedThisMonth()) === savedBefore + 1);
ok("retirée de la carte", !(await getAvailableListings()).some((l) => l.id === listing.id));
process.exit(0);
