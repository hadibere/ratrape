"use client";

import { useNeighborhood } from "@/components/shell/neighborhood-context";

/**
 * Sans position, toutes les distances partent du centre du quartier et peuvent
 * paraître absurdes. On l'explique plutôt que de laisser croire à un bug.
 */
export function GeoBanner({ className = "" }: { className?: string }) {
  const { geo, retryGeo } = useNeighborhood();
  if (geo === "granted" || geo === "pending") return null;

  const denied = geo === "denied";
  return (
    <div className={`bg-notice rounded-2xl px-3.5 py-3 ${className}`}>
      <p className="text-notice-ink text-[13px]/[1.45] font-semibold">
        {denied
          ? "Position non partagée. Les distances partent du centre du quartier."
          : "Position indisponible. Les distances partent du centre du quartier."}
      </p>
      <button
        type="button"
        onClick={retryGeo}
        className="text-brand mt-1.5 cursor-pointer text-[13px] font-bold underline underline-offset-2"
      >
        Réessayer
      </button>
    </div>
  );
}
