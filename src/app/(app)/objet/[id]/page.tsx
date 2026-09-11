import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/listing-detail/listing-detail";
import { getListing } from "@/lib/data/listings";

export default async function ListingPage({ params }: PageProps<"/objet/[id]">) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}
