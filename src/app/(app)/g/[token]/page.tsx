import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ManagePanel } from "@/components/manage/manage-panel";
import { getListingByToken } from "@/lib/data/listings";
import { checkRateLimit } from "@/lib/rate-limit";

/** Un lien de gestion ne doit jamais atterrir dans un moteur de recherche. */
export const metadata: Metadata = {
  title: "Gérer mon annonce · Ratrape",
  robots: { index: false, follow: false },
};

/** Panneau d'explication, réutilisé quand le lien ne mène à rien. */
function Notice({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center p-6 text-center">
      <h1 className="font-display text-ink text-[26px]/[1.15] font-bold">{title}</h1>
      <p className="text-muted mt-2.5 text-[15px]/[1.5]">{children}</p>
      <Link
        href="/"
        className="border-line bg-card font-display text-ink mt-[22px] flex h-[52px] items-center justify-center rounded-2xl border-[1.5px] text-base font-bold"
      >
        Retour à la carte
      </Link>
    </div>
  );
}

export default async function ManagePage({ params }: PageProps<"/g/[token]">) {
  const { token } = await params;

  // Le jeton est court : sans limite, on pourrait le chercher à l'aveugle.
  const headerList = await headers();
  const ip = (headerList.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!checkRateLimit(`manage-view:${ip}`, 20, 60 * 60 * 1000)) {
    return (
      <Notice title="Trop de tentatives">
        Patientez un moment avant de réessayer d’ouvrir un lien de gestion.
      </Notice>
    );
  }

  const listing = await getListingByToken(token);
  if (!listing) {
    return (
      <Notice title="Lien inconnu">
        Ce lien de gestion ne correspond à aucune annonce. Vérifiez que vous l’avez copié en entier.
      </Notice>
    );
  }

  return <ManagePanel listing={listing} token={token} />;
}
