/** Vérifie la recherche d'adresse restreinte à la commune. `pnpm check:address` */
import { COMMUNE, isInsideCommune } from "@/lib/commune";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

type Feature = {
  geometry: { coordinates: [number, number] };
  properties: { label: string; citycode: string; postcode: string };
};

async function search(query: string): Promise<Feature[]> {
  const url =
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}` +
    `&citycode=${COMMUNE.inseeCode}&limit=5&autocomplete=1`;
  const response = await fetch(url);
  const data = (await response.json()) as { features?: Feature[] };
  return data.features ?? [];
}

const mairie = await search("48 avenue Longueil");
ok("adresse de la commune trouvée", mairie.length > 0);
ok(
  "toutes les réponses sont dans la commune",
  mairie.every((f) => f.properties.citycode === COMMUNE.inseeCode),
);
const [lng, lat] = mairie[0].geometry.coordinates;
ok("le point obtenu tombe dans le contour", isInsideCommune({ lat, lng }));
console.log("     première réponse :", mairie[0].properties.label);

// Le Mesnil-le-Roi partage le code postal 78600 : le filtre par commune doit l'exclure.
const voisine = await search("rue de la Paix Le Mesnil-le-Roi");
ok(
  "commune voisine écartée malgré le même code postal",
  voisine.every((f) => f.properties.citycode === COMMUNE.inseeCode),
);

const ailleurs = await search("1 rue de Rivoli Paris");
ok(
  "adresse parisienne écartée",
  ailleurs.every((f) => f.properties.citycode === COMMUNE.inseeCode),
);

process.exit(0);
