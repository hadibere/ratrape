/**
 * Crée le bucket des photos s'il n'existe pas. `pnpm storage:setup`
 * À lancer une fois par projet Supabase.
 */
import { createClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET } from "@/lib/storage";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquant dans .env.local.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Impossible de lister les buckets :", listError.message);
  process.exit(1);
}

if (buckets.some((bucket) => bucket.name === PHOTO_BUCKET)) {
  console.log(`Bucket « ${PHOTO_BUCKET} » déjà présent.`);
  process.exit(0);
}

const { error } = await supabase.storage.createBucket(PHOTO_BUCKET, {
  public: true,
  fileSizeLimit: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
});

if (error) {
  console.error("Création refusée :", error.message);
  process.exit(1);
}

console.log(`Bucket « ${PHOTO_BUCKET} » créé, lecture publique, 2 Mo maximum par fichier.`);
process.exit(0);
