import { NeighborhoodShell } from "@/components/shell/neighborhood-shell";
import { getAvailableListings, getSavedThisMonth } from "@/lib/data/listings";

export default async function NeighborhoodLayout({ children }: LayoutProps<"/">) {
  const [listings, savedThisMonth] = await Promise.all([
    getAvailableListings(),
    getSavedThisMonth(),
  ]);

  return (
    <NeighborhoodShell listings={listings} savedThisMonth={savedThisMonth}>
      {children}
    </NeighborhoodShell>
  );
}
