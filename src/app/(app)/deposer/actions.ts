"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createListing, setPhotoUrl } from "@/lib/data/listings";
import { depositSchema, MANAGE_COOKIE, type DepositState } from "@/lib/deposit";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateToken } from "@/lib/token";
import { uploadPhoto } from "@/lib/storage";

/** Cinq publications par heure et par adresse IP : les voisins passent, pas les robots. */
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

export async function publishListing(
  _previous: DepositState,
  formData: FormData,
): Promise<DepositState> {
  const parsed = depositSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire incomplet" };
  }

  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!checkRateLimit(`deposit:${ip}`, LIMIT, WINDOW_MS)) {
    return { error: "Trop de publications d'affilée. Réessayez dans un moment." };
  }

  const manageToken = generateToken();
  const listing = await createListing({ ...parsed.data, manageToken });

  // La photo suit la création : une annonce sans image reste utile, et un envoi
  // raté ne doit pas faire perdre à l'habitant tout ce qu'il vient de saisir.
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const upload = await uploadPhoto(photo, listing.id);
    if (upload.ok) await setPhotoUrl(listing.id, upload.url);
    else console.warn(`[photo] annonce ${listing.id} publiée sans image (${upload.reason})`);
  }

  const cookieStore = await cookies();
  cookieStore.set(MANAGE_COOKIE, manageToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/deposer/confirmation",
    maxAge: 60 * 15,
  });

  revalidatePath("/");
  redirect("/deposer/confirmation");
}
