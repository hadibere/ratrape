import "server-only";

/**
 * Limite le nombre d'actions par clé sur une fenêtre glissante.
 *
 * Implémentation en mémoire : suffisante pour un seul processus (dev, VPS).
 * Sur un hébergement sans état partagé, remplacer par Upstash Ratelimit en
 * gardant la même signature.
 */
type Hits = number[];

const buckets: Map<string, Hits> = ((
  globalThis as { __ratrapeRateLimit?: Map<string, Hits> }
).__ratrapeRateLimit ??= new Map());

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
