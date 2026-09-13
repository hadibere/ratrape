/** Publie une annonce avec photo de bout en bout, comme le ferait le formulaire. `pnpm db:photo` */
import { createListing, getListing, setPhotoUrl } from "@/lib/data/listings";
import { deletePhotos, uploadPhoto } from "@/lib/storage";
import { generateToken } from "@/lib/token";

const ok = (label: string, condition: boolean) => console.log(condition ? "OK  " : "ÉCHEC", label);

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const listing = await createListing({
  category: "Déco",
  condition: "Bon état",
  address: "12 rue de la Photo",
  spot: "",
  lat: 48.9489,
  lng: 2.1449,
  zone: "Ville",
  manageToken: generateToken(),
});
ok("annonce créée sans photo", listing.photoUrl === null);

const upload = await uploadPhoto(
  new File([new Uint8Array(PNG)], "photo.png", { type: "image/png" }),
  listing.id,
);
ok("photo envoyée au stockage", upload.ok);
if (!upload.ok) process.exit(1);

await setPhotoUrl(listing.id, upload.url);
const stored = await getListing(listing.id);
ok("adresse enregistrée sur l'annonce", stored?.photoUrl === upload.url);
ok("adresse dans le bucket du projet", (stored?.photoUrl ?? "").includes("/public/photos/"));
ok("image servie", (await fetch(stored!.photoUrl!)).ok);

await deletePhotos(listing.id);
console.log("\nNettoyage : relancez `pnpm db:seed`.");
process.exit(0);
