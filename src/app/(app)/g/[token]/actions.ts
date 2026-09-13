"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  markTakenByToken,
  removeByToken,
  updateByToken,
  type ListingEdit,
} from "@/lib/data/listings";
import { checkRateLimit } from "@/lib/rate-limit";
import { deletePhotos } from "@/lib/storage";
import type { ManageState } from "@/lib/manage";

/** Le jeton est un secret court : on borne les tentatives pour décourager la recherche à l'aveugle. */
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

async function guard(): Promise<boolean> {
  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  return checkRateLimit(`manage:${ip}`, LIMIT, WINDOW_MS);
}

const refresh = (id: string) => {
  revalidatePath("/");
  revalidatePath(`/objet/${id}`);
};

export async function editListing(token: string, edit: ListingEdit): Promise<ManageState> {
  if (!(await guard()))
    return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };

  const id = await updateByToken(token, edit);
  if (!id) return { status: "error", message: "Annonce introuvable ou déjà retirée." };

  refresh(id);
  return { status: "saved" };
}

export async function takeListing(token: string): Promise<ManageState> {
  if (!(await guard()))
    return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };

  const id = await markTakenByToken(token);
  if (!id) return { status: "error", message: "Annonce introuvable ou déjà retirée." };

  refresh(id);
  return { status: "taken" };
}

export async function removeListing(token: string): Promise<ManageState> {
  if (!(await guard()))
    return { status: "error", message: "Trop de tentatives. Réessayez plus tard." };

  const id = await removeByToken(token);
  if (!id) return { status: "error", message: "Annonce introuvable." };

  // L'annonce part, ses photos aussi : rien ne doit survivre à un retrait.
  await deletePhotos(id).catch(() => undefined);
  refresh(id);
  return { status: "removed" };
}
