import type { LatLng } from "@/lib/geo";

/**
 * Périmètre de la commune couverte par Ratrape.
 *
 * Contour officiel récupéré le 13 septembre 2026 sur geo.api.gouv.fr, issu du
 * découpage administratif de l'IGN, arrondi au mètre près. Pour ouvrir une autre
 * ville, remplacer ce fichier et le calendrier de `collection.ts`.
 */
export const COMMUNE = {
  name: "Maisons-Laffitte",
  inseeCode: "78358",
  postalCode: "78600",
  center: { lat: 48.9503, lng: 2.1533 } as LatLng,
  bounds: {
    west: 2.12834,
    south: 48.93517,
    east: 2.1783,
    north: 48.96534,
  },
};

/** Anneau extérieur du polygone, en [longitude, latitude]. */
export const COMMUNE_RING: [number, number][] = [
  [2.17822, 48.95963],
  [2.17813, 48.95902],
  [2.178, 48.95881],
  [2.17777, 48.95832],
  [2.1775, 48.95784],
  [2.1769, 48.95708],
  [2.17638, 48.95638],
  [2.1759, 48.95579],
  [2.1755, 48.95533],
  [2.17481, 48.95464],
  [2.17447, 48.95429],
  [2.17333, 48.95348],
  [2.17257, 48.95292],
  [2.1724, 48.95282],
  [2.17161, 48.95224],
  [2.1712, 48.95195],
  [2.17077, 48.95168],
  [2.17015, 48.95131],
  [2.16979, 48.95107],
  [2.16926, 48.95077],
  [2.16904, 48.95062],
  [2.16838, 48.95025],
  [2.16798, 48.95003],
  [2.16774, 48.94993],
  [2.16716, 48.9496],
  [2.16654, 48.9493],
  [2.16568, 48.94884],
  [2.16552, 48.94874],
  [2.16481, 48.94842],
  [2.16421, 48.94811],
  [2.16393, 48.94799],
  [2.16355, 48.94777],
  [2.16293, 48.94749],
  [2.16209, 48.94704],
  [2.16183, 48.94688],
  [2.16142, 48.94667],
  [2.16093, 48.9464],
  [2.16031, 48.94602],
  [2.15979, 48.94575],
  [2.15862, 48.94497],
  [2.15816, 48.94465],
  [2.15771, 48.94439],
  [2.15738, 48.94415],
  [2.15725, 48.94409],
  [2.15652, 48.94364],
  [2.15565, 48.94309],
  [2.15493, 48.94249],
  [2.15346, 48.94129],
  [2.15294, 48.94096],
  [2.1524, 48.94063],
  [2.1518, 48.9404],
  [2.15118, 48.94009],
  [2.15033, 48.93977],
  [2.1495, 48.93947],
  [2.14864, 48.93915],
  [2.14784, 48.93877],
  [2.14629, 48.93797],
  [2.1456, 48.93756],
  [2.1448, 48.93702],
  [2.14416, 48.93655],
  [2.14349, 48.93603],
  [2.14256, 48.93517],
  [2.14093, 48.93625],
  [2.13993, 48.93682],
  [2.13943, 48.93717],
  [2.13919, 48.93729],
  [2.13891, 48.93749],
  [2.13828, 48.93786],
  [2.13738, 48.93872],
  [2.13727, 48.93888],
  [2.13691, 48.93913],
  [2.1361, 48.93961],
  [2.13519, 48.94017],
  [2.13343, 48.94131],
  [2.13168, 48.94248],
  [2.13146, 48.94262],
  [2.13062, 48.9429],
  [2.13093, 48.94362],
  [2.1299, 48.94351],
  [2.12838, 48.94331],
  [2.12834, 48.94388],
  [2.12933, 48.94492],
  [2.12974, 48.94531],
  [2.12997, 48.94556],
  [2.12992, 48.94571],
  [2.12992, 48.946],
  [2.13022, 48.946],
  [2.13023, 48.94642],
  [2.13039, 48.94673],
  [2.13057, 48.94686],
  [2.13163, 48.94747],
  [2.13201, 48.94744],
  [2.13205, 48.94763],
  [2.13196, 48.94767],
  [2.13198, 48.94791],
  [2.13213, 48.94896],
  [2.13222, 48.94939],
  [2.13132, 48.94966],
  [2.13157, 48.94997],
  [2.13287, 48.95164],
  [2.13376, 48.95254],
  [2.13429, 48.95304],
  [2.13474, 48.95339],
  [2.1349, 48.95349],
  [2.1353, 48.95387],
  [2.13506, 48.95401],
  [2.13509, 48.95421],
  [2.13494, 48.9545],
  [2.13411, 48.95501],
  [2.13375, 48.95526],
  [2.13382, 48.95531],
  [2.13475, 48.95605],
  [2.13445, 48.95606],
  [2.13498, 48.95675],
  [2.13428, 48.95715],
  [2.13437, 48.95748],
  [2.13494, 48.95763],
  [2.13554, 48.95735],
  [2.13594, 48.95761],
  [2.13605, 48.95759],
  [2.13661, 48.95734],
  [2.13688, 48.95754],
  [2.13818, 48.95852],
  [2.13821, 48.95861],
  [2.13848, 48.95881],
  [2.13863, 48.95879],
  [2.1408, 48.95764],
  [2.14169, 48.95827],
  [2.14264, 48.95896],
  [2.14307, 48.95924],
  [2.14408, 48.96095],
  [2.14417, 48.96102],
  [2.14435, 48.96152],
  [2.1464, 48.96528],
  [2.14655, 48.96534],
  [2.15402, 48.96501],
  [2.15651, 48.96489],
  [2.161, 48.96469],
  [2.16126, 48.96468],
  [2.16125, 48.96458],
  [2.16389, 48.96446],
  [2.16464, 48.96442],
  [2.16592, 48.96436],
  [2.16741, 48.96432],
  [2.16961, 48.96422],
  [2.17102, 48.96415],
  [2.17136, 48.96413],
  [2.17325, 48.96405],
  [2.17437, 48.964],
  [2.17601, 48.96395],
  [2.17716, 48.96389],
  [2.1782, 48.96388],
  [2.17805, 48.96327],
  [2.17811, 48.96238],
  [2.17826, 48.96119],
  [2.1783, 48.96068],
  [2.17826, 48.95993],
  [2.17822, 48.95963],
];

/** Contour prêt à poser sur la carte. */
export const COMMUNE_GEOJSON = {
  type: "Feature" as const,
  properties: {},
  geometry: { type: "Polygon" as const, coordinates: [COMMUNE_RING] },
};

/** Aire signée d'un anneau : positive s'il tourne dans le sens trigonométrique. */
function signedArea(ring: [number, number][]): number {
  let total = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    total += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return total / 2;
}

/** Le monde entier, dans le sens trigonométrique. Les pôles sont hors projection. */
const WORLD_RING: [number, number][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * Le monde percé d'un trou à la forme de la commune, pour griser tout ce qui
 * est en dehors. Un trou ne se dessine que si son anneau tourne à l'envers de
 * l'anneau extérieur, d'où la vérification du sens.
 */
export const OUTSIDE_COMMUNE_GEOJSON = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      WORLD_RING,
      signedArea(COMMUNE_RING) > 0 ? [...COMMUNE_RING].reverse() : COMMUNE_RING,
    ],
  },
};

/**
 * Point dans le polygone, par lancer de rayon.
 *
 * Le cadre englobant écarte d'emblée la quasi-totalité des cas, ce qui évite de
 * parcourir les 158 segments à chaque appel.
 */
export function isInsideCommune(point: LatLng): boolean {
  const { west, south, east, north } = COMMUNE.bounds;
  if (point.lng < west || point.lng > east || point.lat < south || point.lat > north) return false;

  let inside = false;
  for (let i = 0, j = COMMUNE_RING.length - 1; i < COMMUNE_RING.length; j = i++) {
    const [xi, yi] = COMMUNE_RING[i];
    const [xj, yj] = COMMUNE_RING[j];
    const crosses =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Échappatoire de développement : publier depuis ailleurs que la commune. */
export function locationRestricted(): boolean {
  return process.env.NEXT_PUBLIC_RATRAPE_ANYWHERE !== "1";
}
