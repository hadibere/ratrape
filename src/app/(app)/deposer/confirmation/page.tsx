import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MANAGE_COOKIE, PHOTO_FAILED_COOKIE } from "@/lib/deposit";
import { DepositDone } from "@/components/deposit/deposit-done";
import { getListingByToken } from "@/lib/data/listings";
import { weekdayLabel } from "@/lib/format";
import { CATEGORY_PHRASE } from "@/lib/types";

export default async function ConfirmationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MANAGE_COOKIE)?.value;
  const photoFailed = cookieStore.get(PHOTO_FAILED_COOKIE)?.value === "1";
  if (!token) redirect("/");

  const listing = await getListingByToken(token);
  if (!listing) redirect("/");

  const { article, label } = CATEGORY_PHRASE[listing.category];
  const pronoun = article === "la" ? "la" : "le";
  const sentence = listing.pickupAt
    ? `Votre ${label} est visible par le quartier. Le camion passe ${weekdayLabel(listing.pickupAt)} matin : d’ici là, un voisin peut ${pronoun} prendre.`
    : `Votre ${label} est visible par le quartier. Dès qu’un voisin passe, il peut ${pronoun} prendre.`;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "ratrape.fr";
  const manageUrl = `${site.replace(/^https?:\/\//, "")}/g/${token}`;

  return (
    <DepositDone
      sentence={sentence}
      manageUrl={manageUrl}
      managePath={`/g/${token}`}
      photoFailed={photoFailed}
    />
  );
}
