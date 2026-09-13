/** Envoie une image de test au stockage, vérifie qu'elle est lisible, puis l'efface. `pnpm storage:check` */
import { createClient } from "@supabase/supabase-js";
import { deletePhotos, PHOTO_BUCKET, storagePath, uploadPhoto } from "@/lib/storage";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

// PNG 1×1 pixel, le plus petit fichier valide possible.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const id = `test-${Date.now()}`;
const file = new File([new Uint8Array(PNG)], "photo.png", { type: "image/png" });

const refusedType = await uploadPhoto(
  new File([new Uint8Array([1, 2, 3])], "faux.pdf", { type: "application/pdf" }),
  id,
);
ok("un fichier non-image est refusé", !refusedType.ok && refusedType.reason === "type");

const upload = await uploadPhoto(file, id);
ok("image envoyée", upload.ok);
if (!upload.ok) process.exit(1);

console.log("     adresse publique :", upload.url.replace(/^https:\/\/[^/]+/, "…"));

const response = await fetch(upload.url);
ok(`lisible publiquement (http ${response.status})`, response.ok);
ok("servie comme une image", (response.headers.get("content-type") ?? "").startsWith("image/"));
ok("contenu identique", (await response.arrayBuffer()).byteLength === PNG.byteLength);

const path = storagePath(upload.url);
ok("chemin retrouvé depuis l'adresse publique", path?.startsWith(`${id}/`) === true);

// On interroge le stockage plutôt que l'adresse publique : celle-ci reste en
// cache un an chez le diffuseur, ce qui ne dit rien de l'état du fichier.
await deletePhotos(id);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
);
const { data: rest } = await supabase.storage.from(PHOTO_BUCKET).list(id);
ok("plus aucun fichier dans le dossier de l'annonce", (rest?.length ?? 0) === 0);

process.exit(0);
