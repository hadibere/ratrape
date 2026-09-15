/** Vérifie la gestion par lien secret de bout en bout. `pnpm db:manage` */
import {
  createListing,
  getAvailableListings,
  getListing,
  getListingByToken,
  markTakenByToken,
  removeByToken,
  updateByToken,
} from "@/lib/data/listings";
import { deletePhotos, uploadPhoto } from "@/lib/storage";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const token = generateToken();
const listing = await createListing({
  category: "Meubles",
  condition: "Correct",
  address: "4 rue de la Gestion",
  spot: "Sous le porche",
  lat: 48.9489,
  lng: 2.1449,
  zone: "Ville",
  manageToken: token,
});

ok("ouverte avec le bon jeton", (await getListingByToken(token))?.id === listing.id);
ok("refusée avec un mauvais jeton", (await getListingByToken("AAA-BBB")) === null);
ok(
  "jeton insensible à la casse",
  (await getListingByToken(token.toLowerCase()))?.id === listing.id,
);
ok("zone enregistrée au dépôt", listing.zone === "Ville");

ok(
  "modification acceptée",
  (await updateByToken(token, {
    condition: "À réparer",
    zone: "Parc",
    spot: "Contre le muret",
  })) === listing.id,
);
const edited = await getListing(listing.id);
ok("état modifié", edited?.condition === "À réparer");
ok("zone modifiée", edited?.zone === "Parc");
ok("précision modifiée", edited?.spot === "Contre le muret");

// Retrait : l'annonce et sa photo doivent disparaître ensemble.
const upload = await uploadPhoto(
  new File([new Uint8Array(PNG)], "p.png", { type: "image/png" }),
  listing.id,
);
ok("photo déposée pour le test", upload.ok);

ok("retrait accepté", (await removeByToken(token)) === listing.id);
await deletePhotos(listing.id);
const removed = await getListing(listing.id);
ok("adresse de photo effacée de l'annonce", removed?.photoUrl === null);
ok("disparue de la carte", !(await getAvailableListings()).some((l) => l.id === listing.id));
ok("retrait distinct d'une récupération", removed?.status === "removed");
ok(
  "modification refusée après retrait",
  (await updateByToken(token, { condition: "Correct", zone: "Ville", spot: "" })) === null,
);
ok("« quelqu'un l'a pris » refusé après retrait", (await markTakenByToken(token)) === null);

// Second cas : le déposant signale lui-même que l'objet est parti.
const second = generateToken();
const taken = await createListing({
  category: "Vélos",
  condition: "Bon état",
  address: "5 rue de la Gestion",
  spot: "",
  lat: 48.9489,
  lng: 2.1449,
  zone: "Ville",
  manageToken: second,
});
ok("« quelqu'un l'a pris » accepté", (await markTakenByToken(second)) === taken.id);
ok("statut passé à « pris »", (await getListing(taken.id))?.status === "taken");

console.log("\nNettoyage : relancez `pnpm db:seed`.");
process.exit(0);
