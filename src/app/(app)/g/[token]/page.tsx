import type { Metadata } from "next";
import { headers } from "next/headers";
import { ManagePanel } from "@/components/manage/manage-panel";
import { PanelNotice } from "@/components/shell/panel-notice";
import { getListingByToken } from "@/lib/data/listings";
import { checkRateLimit } from "@/lib/rate-limit";

/** Un lien de gestion ne doit jamais atterrir dans un moteur de recherche. */
export const metadata: Metadata = {
  title: "Gérer mon annonce · Ratrape",
  robots: { index: false, follow: false },
};

export default async function ManagePage({ params }: PageProps<"/g/[token]">) {
  const { token } = await params;

  // Le jeton est court : sans limite, on pourrait le chercher à l'aveugle.
  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!checkRateLimit(`manage-view:${ip}`, 20, 60 * 60 * 1000)) {
    return (
      <PanelNotice title="Trop de tentatives">
        Patientez un moment avant de réessayer d’ouvrir un lien de gestion.
      </PanelNotice>
    );
  }

  const listing = await getListingByToken(token);
  if (!listing) {
    return (
      <PanelNotice title="Lien inconnu">
        Ce lien de gestion ne correspond à aucune annonce. Vérifiez que vous l’avez copié en entier.
      </PanelNotice>
    );
  }

  return <ManagePanel listing={listing} token={token} />;
}
