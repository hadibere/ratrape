"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { markTaken } from "@/lib/data/listings";
import { checkRateLimit } from "@/lib/rate-limit";
import type { TakenState } from "@/lib/deposit";

/** Dix déclarations par heure et par adresse IP : personne n'a besoin de plus. */
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

/**
 * « Je l'ai pris » : l'annonce quitte la carte, et la date de récupération est enregistrée.
 *
 * Aucune authentification n'est possible, l'application n'a pas de comptes.
 * On accepte donc la déclaration de bonne foi, en la limitant en débit, et le
 * déposant garde son lien de gestion pour corriger une erreur.
 */
export async function declareTaken(id: string): Promise<TakenState> {
  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!checkRateLimit(`taken:${ip}`, LIMIT, WINDOW_MS)) {
    return { status: "error", message: "Trop de déclarations d'affilée. Réessayez plus tard." };
  }

  const changed = await markTaken(id);
  if (!changed) return { status: "already" };

  revalidatePath("/");
  revalidatePath(`/objet/${id}`);
  return { status: "taken" };
}
