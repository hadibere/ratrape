import { NeighborhoodShell } from "@/components/shell/neighborhood-shell";
import { getAvailableListings } from "@/lib/data/listings";

// Les annonces changent à chaque dépôt : pas de page figée au build.
export const dynamic = "force-dynamic";

export default async function NeighborhoodLayout({ children }: LayoutProps<"/">) {
  const listings = await getAvailableListings();

  return <NeighborhoodShell listings={listings}>{children}</NeighborhoodShell>;
}
