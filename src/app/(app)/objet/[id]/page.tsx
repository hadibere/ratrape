import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/listing-detail/listing-detail";
import { PanelNotice } from "@/components/shell/panel-notice";
import { getListing } from "@/lib/data/listings";

export default async function ListingPage({ params }: PageProps<"/objet/[id]">) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing || listing.status === "removed") notFound();

  if (listing.status === "collected") {
    return (
      <PanelNotice title="Le camion est passé" mark="·">
        Le ramassage municipal a eu lieu. L’objet a très probablement été emporté.
      </PanelNotice>
    );
  }

  if (listing.status !== "available") {
    return (
      <PanelNotice title="Cet objet est déjà parti" mark="·">
        Un voisin l’a récupéré. C’est une bonne nouvelle : il ne finira pas à la benne.
      </PanelNotice>
    );
  }

  return <ListingDetail listing={listing} />;
}
