/** Vérifie qu'aucune annonce hors commune n'atteint la carte. `pnpm db:perimeter` */
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { listings } from "@/db/schema";
import { COMMUNE } from "@/lib/commune";
import { createListing, getAvailableListings } from "@/lib/data/listings";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const place = async (label: string, lat: number, lng: number) =>
  createListing({
    category: "Meubles",
    condition: "Correct",
    address: label,
    spot: "",
    lat,
    lng,
    zone: "Ville",
    manageToken: generateToken(),
  });

// Trois pièges : loin, juste à côté, et dans le cadre englobant mais hors des limites.
const marseille = await place("Marseille", 43.2965, 5.3698);
const sartrouville = await place("Sartrouville", 48.9383, 2.1636);
const coinDuCadre = await place(
  "Coin du cadre",
  COMMUNE.bounds.south + 0.0005,
  COMMUNE.bounds.west + 0.0005,
);
const mairie = await place("Mairie de Maisons-Laffitte", 48.9489, 2.1449);

const visible = await getAvailableListings();
const ids = new Set(visible.map((l) => l.id));

ok("annonce de la commune visible", ids.has(mairie.id));
ok("Marseille écartée", !ids.has(marseille.id));
ok("Sartrouville écartée", !ids.has(sartrouville.id));
ok("coin du cadre écarté malgré le cadre englobant", !ids.has(coinDuCadre.id));
ok(
  "aucune annonce hors du cadre ne passe",
  visible.every(
    (l) =>
      l.lat >= COMMUNE.bounds.south &&
      l.lat <= COMMUNE.bounds.north &&
      l.lng >= COMMUNE.bounds.west &&
      l.lng <= COMMUNE.bounds.east,
  ),
);

for (const id of [marseille.id, sartrouville.id, coinDuCadre.id, mairie.id]) {
  await getDb().delete(listings).where(eq(listings.id, id));
}
console.log("\nAnnonces de test supprimées.");
process.exit(0);
