/** Vérifie le périmètre communal. `pnpm check:commune` */
import { COMMUNE, COMMUNE_RING, isInsideCommune, OUTSIDE_COMMUNE_GEOJSON } from "@/lib/commune";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

ok("polygone fermé", COMMUNE_RING[0].join() === COMMUNE_RING[COMMUNE_RING.length - 1].join());
ok("centre dans la commune", isInsideCommune(COMMUNE.center));

// Repères réels de Maisons-Laffitte.
const dedans: [string, number, number][] = [
  ["mairie, 48 av. Longueil", 48.9489, 2.1449],
  ["château de Maisons", 48.9506, 2.1428],
  ["gare RER", 48.9556, 2.1444],
];
for (const [label, lat, lng] of dedans) ok(`dedans : ${label}`, isInsideCommune({ lat, lng }));

const dehors: [string, number, number][] = [
  ["Sartrouville", 48.9383, 2.1636],
  ["Le Mesnil-le-Roi", 48.9333, 2.125],
  ["Paris, Notre-Dame", 48.8529, 2.3499],
  ["Saint-Denis de La Réunion", -20.8823, 55.4504],
];
for (const [label, lat, lng] of dehors) ok(`dehors : ${label}`, !isInsideCommune({ lat, lng }));

const { west, south, east, north } = COMMUNE.bounds;
ok("cadre cohérent", west < east && south < north);
const kmLat = (north - south) * 111.32;
const kmLng = (east - west) * 111.32 * Math.cos((COMMUNE.center.lat * Math.PI) / 180);
console.log(
  `     étendue : ${kmLng.toFixed(1)} km d'est en ouest, ${kmLat.toFixed(1)} km du nord au sud`,
);
ok(
  "taille plausible pour une commune de 7 km²",
  kmLat > 1 && kmLat < 12 && kmLng > 1 && kmLng < 12,
);

// Le voile extérieur : un monde percé à la forme de la commune.
const rings = OUTSIDE_COMMUNE_GEOJSON.geometry.coordinates;
const area = (ring: number[][]) => {
  let total = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    total += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return total / 2;
};
ok("deux anneaux : le monde et le trou", rings.length === 2);
ok("anneau extérieur dans le sens trigonométrique", area(rings[0]) > 0);
ok("trou en sens inverse, donc réellement percé", area(rings[1]) < 0);
ok("le trou a la taille de la commune", Math.abs(area(rings[1])) === Math.abs(area(COMMUNE_RING)));

process.exit(0);
