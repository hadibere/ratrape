import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** Sans 0/O/1/I pour éviter les confusions à la lecture. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Jeton de gestion lisible, du type « 8K2-PLM ». */
export function generateToken(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${out.slice(0, 3)}-${out.slice(3)}`;
}

/** Seule l'empreinte est stockée : un accès à la base ne donne pas les jetons. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token.trim().toUpperCase()).digest("hex");
}
