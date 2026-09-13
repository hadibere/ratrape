"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { declareTaken } from "@/app/(app)/objet/[id]/actions";
import { DirectionsButton } from "@/components/listing-detail/directions-button";
import { useNeighborhood } from "@/components/shell/neighborhood-context";
import type { TakenState } from "@/lib/deposit";
import { formatPickup, formatPosted } from "@/lib/format";
import { distanceMeters, formatDistance, formatWalk } from "@/lib/geo";
import { ListingPhoto } from "@/components/listings/listing-photo";
import type { Listing } from "@/lib/types";

function InfoRow({
  label,
  value,
  note,
  variant = "plain",
}: {
  label: string;
  value: string;
  note?: string;
  variant?: "plain" | "notice";
}) {
  const notice = variant === "notice";
  return (
    <div className={`px-[15px] py-[13px] ${notice ? "bg-notice" : "bg-card"}`}>
      <div
        className={`text-[11px] font-semibold tracking-[0.06em] uppercase ${notice ? "text-notice-ink" : "text-label"}`}
      >
        {label}
      </div>
      <div className="text-ink mt-[3px] text-[15px] font-semibold">{value}</div>
      {note ? (
        <div className={`mt-0.5 text-[13px] ${notice ? "text-notice-ink" : "text-muted"}`}>
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function ListingDetail({ listing }: { listing: Listing }) {
  const { center } = useNeighborhood();
  const [taken, setTaken] = useState<TakenState>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  const declare = () => {
    startTransition(async () => setTaken(await declareTaken(listing.id)));
  };

  const takenLabel =
    taken.status === "taken"
      ? "C'est noté, merci !"
      : taken.status === "already"
        ? "Déjà récupéré"
        : pending
          ? "Enregistrement…"
          : "Je l'ai pris";
  const done = taken.status === "taken" || taken.status === "already";
  const meters = distanceMeters(center, listing);

  return (
    <>
      {/* Photo : aplat en attendant les photos téléversées par les habitants */}
      <div className="wide:h-[230px] relative h-[268px] flex-none">
        <ListingPhoto
          listing={listing}
          sizes="(min-width: 900px) 420px, 100vw"
          priority
          className="absolute inset-0 h-full w-full"
        />
        <Link
          href="/"
          aria-label="Retour à la carte"
          className="bg-surface/90 text-ink absolute top-3.5 left-4 flex h-10 w-10 items-center justify-center rounded-full text-[17px] font-bold"
        >
          ‹
        </Link>
      </div>

      <div className="scrl wide:px-6 min-h-0 flex-1 overflow-y-auto px-5 pt-[18px]">
        <div className="flex items-center gap-2">
          <span className="bg-brand-soft font-display text-brand rounded-full px-[11px] py-1.5 text-xs font-bold">
            {listing.condition}
          </span>
          <span className="text-muted text-xs font-semibold">
            {[formatDistance(meters), formatWalk(meters)].filter(Boolean).join(" · ")}
          </span>
        </div>

        <h1 className="wide:text-2xl font-display text-ink mt-2.5 text-[25px]/[1.15] font-bold text-pretty">
          {listing.name}
        </h1>

        <div className="border-line bg-line mt-4 grid gap-px overflow-hidden rounded-2xl border">
          <InfoRow label="Adresse" value={listing.address} note={listing.spot ?? undefined} />
          <InfoRow label="Déposé" value={formatPosted(listing.postedAt)} />
          <InfoRow
            label="Ramassage de la ville"
            value={formatPickup(listing.pickupAt)}
            note="À prendre avant le camion."
            variant="notice"
          />
        </div>

        <p className="text-muted mt-3.5 text-[13px]/[1.5]">
          Pas de compte, pas de message à envoyer. Si l&apos;objet vous plaît, allez le chercher.
        </p>
      </div>

      <div className="wide:px-6 wide:pb-[22px] border-line-soft bg-surface flex flex-none gap-2.5 border-t px-5 pt-3.5 pb-5">
        <DirectionsButton listing={listing} />
        <button
          type="button"
          onClick={declare}
          disabled={pending || done}
          aria-pressed={done}
          className={`wide:h-[52px] border-brand bg-card font-display text-brand h-[54px] flex-1 rounded-2xl border-[1.5px] text-base font-bold ${
            pending || done ? "cursor-default opacity-70" : "cursor-pointer"
          }`}
        >
          {takenLabel}
        </button>
      </div>

      {taken.status === "error" ? (
        <p
          role="alert"
          className="text-danger wide:px-6 flex-none px-5 pb-4 text-[13px] font-semibold"
        >
          {taken.message}
        </p>
      ) : null}
    </>
  );
}
