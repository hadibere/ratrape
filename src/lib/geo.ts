export type LatLng = { lat: number; lng: number };

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

/** Au-delà, personne n'y va à pied : autant ne rien annoncer. */
const WALKABLE_METERS = 5000;

/** Temps de marche à environ 80 m par minute, ou null si c'est hors de portée. */
export function formatWalk(meters: number): string | null {
  if (meters > WALKABLE_METERS) return null;
  return `${Math.max(1, Math.round(meters / 80))} min à pied`;
}

/** Décalage est / nord en mètres entre deux points, pour positionner un pin. */
export function offsetMeters(from: LatLng, to: LatLng): { east: number; north: number } {
  return {
    east: distanceMeters(from, { lat: from.lat, lng: to.lng }) * (to.lng >= from.lng ? 1 : -1),
    north: distanceMeters(from, { lat: to.lat, lng: from.lng }) * (to.lat >= from.lat ? 1 : -1),
  };
}

/** Itinéraire en voiture dans Google Maps, depuis la position courante du téléphone. */
export function googleMapsUrl(to: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${to.lat},${to.lng}`;
}

/** Navigation Waze, en voiture : c'est le seul mode de l'application. */
export function wazeUrl(to: LatLng): string {
  return `https://www.waze.com/ul?ll=${to.lat}%2C${to.lng}&navigate=yes`;
}
