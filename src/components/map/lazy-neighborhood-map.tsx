"use client";

import dynamic from "next/dynamic";

/**
 * MapLibre pèse près d'un mégaoctet : on ne le télécharge que lorsqu'une carte
 * est réellement affichée, pas sur la fiche ou le formulaire en mobile.
 */
export const LazyNeighborhoodMap = dynamic(
  () => import("./neighborhood-map").then((module) => module.NeighborhoodMap),
  { ssr: false, loading: () => <div className="bg-map h-full w-full" /> },
);
