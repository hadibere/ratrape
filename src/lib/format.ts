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

/**
 * Heure et minute à Paris, lues pièce par pièce.
 *
 * Indispensable pour l'hydratation : selon la version d'ICU, « fr-FR » rend
 * « 6:00 », « 06:00 » ou « 6 h 00 ». Le serveur et le navigateur n'ont pas la
 * même, donc on ne garde que les nombres et on compose le texte nous-mêmes.
 */
function parisTime(date: Date): { hour: number; minute: string } {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { hour: Number(part("hour")), minute: part("minute") };
}

function parisHour(date: Date): number {
  return parisTime(date).hour;
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, dateStyle: "short" }).format(d);

/** « 9:15 » — sans zéro initial, identique sur le serveur et dans le navigateur. */
const clock = (d: Date) => {
  const { hour, minute } = parisTime(d);
  return `${hour}:${minute}`;
};

/** « Aujourd'hui 9:15 », « Hier 18:20 », sinon « Mar. 9 sept. 18:20 ». */
export function formatPosted(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const key = dayKey(d);
  if (key === dayKey(now)) return `Aujourd'hui ${clock(d)}`;
  if (key === dayKey(new Date(now.getTime() - 86_400_000))) return `Hier ${clock(d)}`;
  const day = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${cap(day)} ${clock(d)}`;
}

/** « Jeudi 17 sept., 6h00 ». */
export function formatPickup(iso: string | null): string {
  if (!iso) return "Date inconnue";
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${cap(day)}, ${clock(d).replace(":", "h")}`; // « Vendredi 18 sept., 6h00 »
}

/** « jeudi » — pour la phrase de confirmation. */
export function weekdayLabel(iso: string | null): string {
  if (!iso) return "bientôt";
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long" }).format(new Date(iso));
}
