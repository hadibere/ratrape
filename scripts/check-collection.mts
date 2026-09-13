/** Vérifie le calendrier de collecte de Maisons-Laffitte. `pnpm check:collection` */
import {
  formatCollectionDay,
  formatEve,
  holidayOn,
  holidayWarning,
  nextCollection,
  zoneFromDate,
} from "@/lib/collection";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);
const at = (iso: string) => new Date(iso);

// Septembre 2026 : mercredis les 2, 9, 16, 23, 30. Ville = 9, Parc = 23.
ok(
  "zone ville, début septembre → 9 septembre",
  formatCollectionDay(nextCollection("Ville", at("2026-09-01T10:00:00Z"))) ===
    "Mercredi 9 septembre",
);
ok(
  "zone parc, début septembre → 23 septembre",
  formatCollectionDay(nextCollection("Parc", at("2026-09-01T10:00:00Z"))) ===
    "Mercredi 23 septembre",
);
ok(
  "zone ville, après le 9 → 14 octobre",
  formatCollectionDay(nextCollection("Ville", at("2026-09-13T10:00:00Z"))) ===
    "Mercredi 14 octobre",
);
ok(
  "zone parc, après le 23 → 28 octobre",
  formatCollectionDay(nextCollection("Parc", at("2026-09-24T10:00:00Z"))) === "Mercredi 28 octobre",
);
ok(
  "passage de décembre à janvier",
  formatCollectionDay(nextCollection("Ville", at("2026-12-20T10:00:00Z"))) ===
    "Mercredi 13 janvier",
);

const parc = nextCollection("Parc", at("2026-09-01T10:00:00Z"));
ok("veille au soir annoncée", formatEve(parc) === "mardi 22 au soir");
ok(
  "toujours un mercredi",
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long" }).format(parc) ===
    "mercredi",
);

ok(
  "zone retrouvée depuis la date (ville)",
  zoneFromDate(nextCollection("Ville").toISOString()) === "Ville",
);
ok(
  "zone retrouvée depuis la date (parc)",
  zoneFromDate(nextCollection("Parc").toISOString()) === "Parc",
);

// Sur cinq ans, la date tombe toujours un mercredi et dans le bon quantième.
let allGood = true;
for (let i = 0; i < 60; i++) {
  const from = new Date(Date.UTC(2026, i, 1));
  for (const zone of ["Ville", "Parc"] as const) {
    const date = nextCollection(zone, from);
    const parts = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      day: "numeric",
    }).formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const day = Number(parts.find((p) => p.type === "day")?.value);
    const expected = zone === "Ville" ? 2 : 4;
    if (weekday !== "mercredi" || Math.ceil(day / 7) !== expected) allGood = false;
  }
}
ok("cohérent sur cinq ans, changements d'heure compris", allGood);
// Jours fériés tombant un jour de collecte : on ne les corrige pas, on les signale.
ok(
  "11 novembre 2026 repéré comme férié",
  holidayOn(nextCollection("Ville", at("2026-11-01T10:00:00Z"))) === "Armistice",
);
ok(
  "un mercredi ordinaire n'alerte pas",
  holidayWarning(nextCollection("Parc", at("2026-09-01T10:00:00Z"))) === null,
);
ok(
  "le message invite à confirmer",
  (holidayWarning(nextCollection("Ville", at("2026-11-01T10:00:00Z"))) ?? "").includes("confirmer"),
);

// Sur vingt ans, combien de collectes tombent un jour férié ?
const touched: string[] = [];
for (let year = 2026; year < 2046; year++) {
  for (let month = 0; month < 12; month++) {
    for (const zone of ["Ville", "Parc"] as const) {
      const date = nextCollection(zone, new Date(Date.UTC(year, month, 1)));
      const holiday = holidayOn(date);
      if (holiday && date.getUTCFullYear() === year) {
        touched.push(`${formatCollectionDay(date)} ${year} (${zone}, ${holiday})`);
      }
    }
  }
}
const uniques = [...new Set(touched)];
console.log(`     ${uniques.length} collectes fériées d'ici 2046, dont :`);
for (const line of uniques.slice(0, 4)) console.log("       ", line);
ok("des collectes fériées existent bien", uniques.length > 0);

process.exit(0);
