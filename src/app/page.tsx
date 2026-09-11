import { MapScreen } from "@/components/map-screen/map-screen";
import { getAvailableListings, getSavedThisMonth } from "@/lib/data/listings";

export default async function Home() {
  const [listings, savedThisMonth] = await Promise.all([
    getAvailableListings(),
    getSavedThisMonth(),
  ]);

  return <MapScreen listings={listings} savedThisMonth={savedThisMonth} />;
}
