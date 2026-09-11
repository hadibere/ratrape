"use client";

import { useEffect, useState } from "react";

/** Même bascule que la feuille de style : 900 px. */
const WIDE = "(min-width: 900px)";

/**
 * Sert uniquement à décider où monter la carte, pas à faire la mise en page :
 * une seule instance MapLibre doit exister à la fois.
 * `null` tant que le composant n'est pas monté côté navigateur.
 */
export function useIsWide(): boolean | null {
  const [isWide, setIsWide] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isWide;
}
