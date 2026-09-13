"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { editListing, removeListing, takeListing } from "@/app/(app)/g/[token]/actions";
import { ChoiceButtons } from "@/components/deposit/choice-buttons";
import { ZoneChoice } from "@/components/deposit/zone-choice";
import { ListingPhoto } from "@/components/listings/listing-photo";
import { formatCollectionDay, nextCollection, type Zone } from "@/lib/collection";
import { formatPosted } from "@/lib/format";
import type { ManageState } from "@/lib/manage";
import { CONDITIONS, type Condition, type Listing } from "@/lib/types";

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="font-display text-ink mt-[18px] mb-2 text-[13px] font-bold">{children}</h2>
);

export function ManagePanel({ listing, token }: { listing: Listing; token: string }) {
  const [state, setState] = useState<ManageState>({ status: "idle" });
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const [condition, setCondition] = useState<Condition>(listing.condition);
  const [zone, setZone] = useState<Zone>(listing.zone ?? "Ville");
  const [spot, setSpot] = useState(listing.spot ?? "");

  const run = (action: () => Promise<ManageState>) => {
    startTransition(async () => {
      setConfirming(false);
      setState(await action());
    });
  };

  // Une annonce prise ou retirée ne se modifie plus : on ferme la page proprement.
  const closed =
    state.status === "removed" || state.status === "taken" || listing.status !== "available";

  if (closed) {
    const message =
      state.status === "removed" || listing.status === "removed"
        ? "Votre annonce a été retirée de la carte."
        : "Votre annonce est marquée comme récupérée. Merci d’avoir prévenu le quartier.";
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center p-6 text-center">
        <div className="bg-brand font-display mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full text-[40px] font-bold text-white">
          ✓
        </div>
        <h1 className="font-display text-ink text-[26px]/[1.15] font-bold">C’est réglé</h1>
        <p className="text-muted mt-2.5 text-[15px]/[1.5]">{message}</p>
        <Link
          href="/"
          className="border-line bg-card font-display text-ink mt-[22px] flex h-[52px] items-center justify-center rounded-2xl border-[1.5px] text-base font-bold"
        >
          Retour à la carte
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="wide:border-line-soft wide:px-6 wide:pt-5 wide:pb-3 wide:border-b flex flex-none items-center gap-3 border-b border-transparent px-5 pt-4 pb-2.5">
        <Link
          href="/"
          aria-label="Retour à la carte"
          className="border-line bg-card text-ink flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border text-[17px] font-bold"
        >
          ‹
        </Link>
        <div>
          <h1 className="font-display text-ink text-[18px]/[1.1] font-bold">Gérer mon annonce</h1>
          <p className="text-muted mt-0.5 text-xs">Aucun compte, ce lien suffit</p>
        </div>
      </div>

      <div className="scrl wide:px-6 wide:pt-4 min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-3">
        <div className="border-line bg-card flex items-center gap-3 rounded-2xl border p-2.5">
          <ListingPhoto
            listing={listing}
            sizes="76px"
            className="h-[66px] w-[76px] flex-none rounded-xl"
          />
          <span className="block min-w-0">
            <span className="font-display text-ink block text-[15px]/[1.2] font-bold">
              {listing.name}
            </span>
            <span className="text-muted mt-1 block text-xs">{listing.address}</span>
            <span className="text-muted mt-[3px] block text-xs">
              Déposé {formatPosted(listing.postedAt).toLowerCase()}
            </span>
            <span className="text-brand mt-[3px] block text-xs font-semibold">
              Collecte{" "}
              {formatCollectionDay(
                new Date(listing.pickupAt || nextCollection(zone)),
              ).toLowerCase()}
            </span>
          </span>
        </div>

        <SectionTitle>État</SectionTitle>
        <ChoiceButtons
          options={CONDITIONS}
          value={condition}
          onChange={setCondition}
          layout="blocks"
        />

        <SectionTitle>Zone de collecte</SectionTitle>
        <ZoneChoice value={zone} onChange={setZone} />

        <SectionTitle>Précision d’emplacement</SectionTitle>
        <input
          value={spot}
          onChange={(event) => setSpot(event.target.value)}
          placeholder="Devant le portail vert…"
          className="border-line bg-card text-ink w-full rounded-2xl border px-[15px] py-[13px] text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => run(() => editListing(token, { condition, zone, spot }))}
          disabled={pending}
          className="bg-brand font-display hover:bg-brand-hover mt-4 h-[52px] w-full cursor-pointer rounded-2xl text-base font-bold text-white disabled:cursor-default disabled:opacity-70"
        >
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>

        {state.status === "saved" ? (
          <p role="status" className="text-brand mt-3 text-[13px] font-semibold">
            Modifications enregistrées.
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-danger mt-3 text-[13px] font-semibold">
            {state.message}
          </p>
        ) : null}

        <SectionTitle>L’objet n’est plus sur le trottoir</SectionTitle>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => run(() => takeListing(token))}
            disabled={pending}
            className="border-brand bg-card font-display text-brand h-[52px] cursor-pointer rounded-2xl border-[1.5px] text-base font-bold disabled:cursor-default disabled:opacity-70"
          >
            Quelqu’un l’a pris
          </button>

          {confirming ? (
            <div className="border-danger bg-card rounded-2xl border-[1.5px] p-3.5">
              <p className="text-ink text-[13px]/[1.45] font-semibold">
                Retirer l’annonce la fait disparaître de la carte, avec sa photo. C’est définitif.
              </p>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => run(() => removeListing(token))}
                  disabled={pending}
                  className="bg-danger font-display h-[46px] flex-1 cursor-pointer rounded-2xl text-[15px] font-bold text-white disabled:cursor-default disabled:opacity-70"
                >
                  {pending ? "Retrait…" : "Oui, retirer"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="border-line bg-card font-display text-ink h-[46px] flex-1 cursor-pointer rounded-2xl border text-[15px] font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-danger font-display h-[52px] cursor-pointer rounded-2xl text-base font-bold"
            >
              Retirer l’annonce
            </button>
          )}
        </div>
      </div>
    </>
  );
}
