const TZ = "Europe/Paris";

const WEEKDAYS: Record<string, number> = {
  "lun.": 1,
  "mar.": 2,
  "mer.": 3,
  "jeu.": 4,
  "ven.": 5,
  "sam.": 6,
  "dim.": 7,
};

/** Heure de Paris pour un instant donné. Le format français ajoute « h », on lit la partie. */
function parisHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "12");
}

/**
 * Prochaine occurrence d'un jour de la semaine à 6h00, heure de Paris
 * (1 = lundi … 7 = dimanche). Provisoire : en production, les dates viendront
 * du calendrier de collecte de la commune.
 */
export function nextWeekdayAt6(weekday: number, from: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(from);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = Number(part("day"));
  const today = WEEKDAYS[part("weekday")] ?? 1;

  let delta = (weekday - today + 7) % 7;
  if (delta === 0) delta = 7; // le camion est déjà passé ce matin

  // Décalage horaire de Paris ce jour-là (1 h en hiver, 2 h en été).
  const noon = new Date(Date.UTC(year, month - 1, day + delta, 12, 0, 0));
  const offset = parisHour(noon) - 12;
  return new Date(Date.UTC(year, month - 1, day + delta, 6 - offset, 0, 0));
}
