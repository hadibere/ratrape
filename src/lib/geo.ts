export type LatLng = { lat: number; lng: number };

/** Centre par défaut tant que la géolocalisation n'a pas répondu (quartier Saint-Roch). */
export const DEFAULT_CENTER: LatLng = { lat: 43.605, lng: 3.878 };

const EARTH_RADIUS = 6_371_000;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Distance à vol d'oiseau en mètres (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

/** « 120 m » sous le kilomètre (arrondi à 10 m), « 1,2 km » au-delà. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

/** Temps de marche à environ 80 m par minute, au moins 1 minute. */
export function formatWalk(meters: number): string {
  return `${Math.max(1, Math.round(meters / 80))} min à pied`;
}

/** Décalage est / nord en mètres entre deux points, pour positionner un pin. */
export function offsetMeters(from: LatLng, to: LatLng): { east: number; north: number } {
  return {
    east: distanceMeters(from, { lat: from.lat, lng: to.lng }) * (to.lng >= from.lng ? 1 : -1),
    north: distanceMeters(from, { lat: to.lat, lng: from.lng }) * (to.lat >= from.lat ? 1 : -1),
  };
}

/** Itinéraire piéton dans l'application de cartes du téléphone. */
export function directionsUrl(point: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=${point.lat},${point.lng}`;
}
