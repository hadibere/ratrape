/**
 * Règles de collecte des encombrants à Maisons-Laffitte.
 *
 * Source : site de la ville, rubrique « Déchets spécifiques ». Une collecte par
 * mois, le mercredi, selon la zone. Les objets se sortent la veille au soir.
 * À revoir si la commune change son calendrier, ou pour ouvrir une autre ville.
 */
export const ZONES = ["Ville", "Parc"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_DETAILS: Record<Zone, { weekOfMonth: number; sectors: string }> = {
  Ville: { weekOfMonth: 2, sectors: "Grand-Maisons, Longueil" },
  Parc: { weekOfMonth: 4, sectors: "Albine-Château, Napoléon-Charlemagne" },
};

/** Limites imposées par la ville, rappelées au dépôt. */
export const LIMITS = "3 m³ par foyer et par mois, 50 kg et 2 m par objet.";

/** Amende encourue pour un dépôt hors des règles de collecte. */
export const FINE_EUROS = 135;

/** L'électroménager et l'électronique ne sont pas ramassés avec les encombrants. */
export const WEEE_NOTICE =
  "L’électroménager, les télévisions et les ordinateurs ne sont pas ramassés avec les encombrants : " +
  "ils se déposent au parking de l’église Saint-Nicolas, le 3e samedi du mois.";

/** Heure conventionnelle du passage, faute d'horaire publié par la ville. */
const PICKUP_HOUR_PARIS = 6;
const WEDNESDAY = 3;

function parisOffsetHours(year: number, monthIndex: number, day: number): number {
  const noon = new Date(Date.UTC(year, monthIndex, day, 12));
  const parisHour = Number(
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(noon)
      .find((part) => part.type === "hour")?.value ?? "12",
  );
  return parisHour - 12;
}

/** Nième mercredi d'un mois donné, à l'heure de passage, en temps universel. */
function nthWednesday(year: number, monthIndex: number, nth: number): Date {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const day = 1 + ((WEDNESDAY - firstWeekday + 7) % 7) + (nth - 1) * 7;
  const offset = parisOffsetHours(year, monthIndex, day);
  return new Date(Date.UTC(year, monthIndex, day, PICKUP_HOUR_PARIS - offset));
}

/** Prochaine collecte pour une zone : ce mois-ci si elle n'est pas passée, sinon le mois suivant. */
export function nextCollection(zone: Zone, from: Date = new Date()): Date {
  const { weekOfMonth } = ZONE_DETAILS[zone];
  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const thisMonth = nthWednesday(year, month, weekOfMonth);
  return thisMonth.getTime() > from.getTime()
    ? thisMonth
    : nthWednesday(year, month + 1, weekOfMonth);
}

/** « mercredi 23 septembre » */
export function formatCollectionDay(date: Date): string {
  const text = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « mardi 22 au soir » — le moment où l'objet doit sortir sur le trottoir. */
export function formatEve(date: Date): string {
  const eve = new Date(date.getTime() - 24 * 3600 * 1000);
  const text = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
  }).format(eve);
  return `${text} au soir`;
}

/** Retrouve la zone d'une date de collecte enregistrée, quand elle n'a pas été stockée. */
export function zoneFromDate(iso: string | null): Zone | null {
  if (!iso) return null;
  const date = new Date(iso);
  const day = Number(
    new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric" }).format(date),
  );
  const nth = Math.ceil(day / 7);
  if (nth === ZONE_DETAILS.Ville.weekOfMonth) return "Ville";
  if (nth === ZONE_DETAILS.Parc.weekOfMonth) return "Parc";
  return null;
}
