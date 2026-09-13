import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Bucket public : les photos d'encombrants sont faites pour être vues. */
export const PHOTO_BUCKET = "photos";

/** Formats acceptés, alignés sur ce que produit la compression du navigateur. */
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

/** La compression côté navigateur vise 600 Ko ; on laisse de la marge. */
const MAX_BYTES = 2 * 1024 * 1024;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquant. " +
        "Voir .env.example, la clé secrète se trouve dans Project Settings, API Keys.",
    );
  }
  // La clé de service ne quitte jamais le serveur : aucune session à conserver.
  return createClient(url, key, { auth: { persistSession: false } });
}

export type UploadResult =
  { ok: true; url: string } | { ok: false; reason: "type" | "taille" | "envoi" };

/**
 * Dépose la photo d'une annonce et renvoie son adresse publique.
 *
 * Le fichier arrive déjà réduit et réencodé par le navigateur, ce qui supprime
 * au passage les métadonnées EXIF, dont la position GPS de la prise de vue.
 */
export async function uploadPhoto(file: File, listingId: string): Promise<UploadResult> {
  if (!ACCEPTED.has(file.type)) return { ok: false, reason: "type" };
  if (file.size > MAX_BYTES) return { ok: false, reason: "taille" };

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Un nom unique par envoi : les photos sont mises en cache un an par le réseau
  // de diffusion, donc remplacer un fichier à la même adresse laisserait
  // l'ancienne image visible pendant des mois.
  const path = `${listingId}/${Math.random().toString(36).slice(2, 10)}.${extension}`;

  const supabase = client();
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

  if (error) {
    console.error("[photo] envoi refusé :", error.message);
    return { ok: false, reason: "envoi" };
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** Chemin de l'objet dans le bucket, extrait de son adresse publique. */
export function storagePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${PHOTO_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}

/** Supprime les photos d'une annonce retirée par son lien de gestion. */
export async function deletePhotos(listingId: string): Promise<void> {
  const supabase = client();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).list(listingId);
  if (!data?.length) return;
  await supabase.storage
    .from(PHOTO_BUCKET)
    .remove(data.map((entry) => `${listingId}/${entry.name}`));
}
