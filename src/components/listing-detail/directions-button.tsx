"use client";

import { useEffect, useRef, useState } from "react";
import { googleMapsUrl, wazeUrl } from "@/lib/geo";
import type { Listing } from "@/lib/types";

const APPS = [
  { id: "google", label: "Google Maps", url: googleMapsUrl },
  { id: "waze", label: "Waze", url: wazeUrl },
] as const;

/**
 * « Y aller » ouvre le choix de l'application de navigation.
 *
 * Ce sont des boutons et non des liens : certains bloqueurs de publicité
 * effacent le contenu des liens pointant vers ces services.
 */
export function DirectionsButton({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const go = (url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      {open ? (
        <div
          role="dialog"
          aria-label="Choisir une application de navigation"
          className="border-line bg-card shadow-overlay absolute right-0 bottom-full left-0 mb-2.5 overflow-hidden rounded-2xl border"
        >
          {APPS.map((app, index) => (
            <button
              key={app.id}
              type="button"
              autoFocus={index === 0}
              onClick={() => go(app.url(listing))}
              className={`hover:bg-surface font-display text-ink w-full cursor-pointer px-4 py-3.5 text-left text-[15px] font-bold ${
                index > 0 ? "border-line-soft border-t" : ""
              }`}
            >
              {app.label}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="bg-brand font-display hover:bg-brand-hover wide:h-[52px] h-[54px] w-full cursor-pointer rounded-2xl text-base font-bold text-white"
      >
        Y aller
      </button>
    </div>
  );
}
