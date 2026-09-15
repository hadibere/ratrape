/** Vérifie la déclaration « je l'ai pris » de bout en bout. `pnpm db:taken` */
import { createListing, getAvailableListings, getListing, markTaken } from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

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
ok("statut passé à « pris »", (await getListing(listing.id))?.status === "taken");
ok("deuxième déclaration refusée", !(await markTaken(listing.id)));
ok("statut inchangé après le refus", (await getListing(listing.id))?.status === "taken");
ok("retirée de la carte", !(await getAvailableListings()).some((l) => l.id === listing.id));
process.exit(0);
