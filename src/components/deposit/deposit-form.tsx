"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { publishListing } from "@/app/(app)/deposer/actions";
import type { DepositState } from "@/lib/deposit";
import { ChoiceButtons } from "@/components/deposit/choice-buttons";
import { useNeighborhood } from "@/components/shell/neighborhood-context";
import {
  CATEGORIES,
  CONDITIONS,
  PICKUP_CHOICES,
  type Category,
  type Condition,
  type PickupChoice,
} from "@/lib/types";

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="font-display text-ink mt-[18px] mb-2 text-[13px] font-bold">{children}</h2>
);

/** Adresse la plus proche du point, via la Base Adresse Nationale. */
async function reverseGeocode(lat: number, lng: number, signal: AbortSignal): Promise<string> {
  const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Géocodage indisponible");
  const data = (await response.json()) as {
    features?: { properties?: { name?: string; label?: string } }[];
  };
  const properties = data.features?.[0]?.properties;
  const address = properties?.name ?? properties?.label;
  if (!address) throw new Error("Aucune adresse trouvée");
  return address;
}

export function DepositForm() {
  const { center } = useNeighborhood();
  const [state, formAction, pending] = useActionState<DepositState, FormData>(publishListing, {});

  const [category, setCategory] = useState<Category>("Meubles");
  const [condition, setCondition] = useState<Condition>("Correct");
  const [pickup, setPickup] = useState<PickupChoice>("Jeudi");
  const [rule, setRule] = useState(false);

  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [detecting, setDetecting] = useState(true);
  const addressTouched = useRef(false);

  const [photoName, setPhotoName] = useState<string | null>(null);

  // L'adresse suit la position tant que l'habitant ne l'a pas corrigée lui-même.
  useEffect(() => {
    if (addressTouched.current) return;
    const controller = new AbortController();
    setDetecting(true);
    reverseGeocode(center.lat, center.lng, controller.signal)
      .then((found) => {
        if (!addressTouched.current) setAddress(found);
      })
      .catch(() => undefined)
      .finally(() => setDetecting(false));
    return () => controller.abort();
  }, [center]);

  const editAddress = (value: string) => {
    addressTouched.current = true;
    setAddress(value);
  };

  const ready = rule && address.trim().length >= 3;

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="condition" value={condition} />
      <input type="hidden" name="pickup" value={pickup} />
      <input type="hidden" name="lat" value={center.lat} />
      <input type="hidden" name="lng" value={center.lng} />
      <input type="hidden" name="rule" value={rule ? "on" : ""} />

      <div className="wide:border-b wide:border-line-soft wide:px-6 wide:pt-5 wide:pb-3 flex flex-none items-center gap-3 px-5 pt-4 pb-2.5">
        <Link
          href="/"
          aria-label="Retour à la carte"
          className="border-line bg-card text-ink flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border text-[17px] font-bold"
        >
          ‹
        </Link>
        <div>
          <h1 className="font-display text-ink text-[18px]/[1.1] font-bold">
            Je dépose un encombrant
          </h1>
          <p className="text-muted mt-0.5 text-xs">Moins d’une minute, 5 champs</p>
        </div>
      </div>

      <div className="scrl wide:px-6 wide:pt-4 min-h-0 flex-1 overflow-y-auto px-5 pt-1.5 pb-2.5">
        <label className="swatch-photo-zone border-line-disabled wide:h-[140px] flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[18px] border-[1.5px] border-dashed">
          <span className="font-display text-ink text-[15px] font-bold">
            {photoName ?? (
              <>
                <span className="wide:hidden">Prendre une photo</span>
                <span className="wide:inline hidden">Ajouter une photo</span>
              </>
            )}
          </span>
          <span className="text-muted font-mono text-[11px] font-semibold">
            photo de l’objet sur le trottoir
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? null)}
          />
        </label>

        <SectionTitle>Type d’objet</SectionTitle>
        <ChoiceButtons
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
          layout="pills"
        />

        <SectionTitle>État</SectionTitle>
        <ChoiceButtons
          options={CONDITIONS}
          value={condition}
          onChange={setCondition}
          layout="blocks"
        />

        <SectionTitle>Emplacement</SectionTitle>
        <div className="border-line bg-card rounded-2xl border px-[15px] py-[13px]">
          <div className="flex items-center justify-between gap-2.5">
            {editingAddress || (!address && !detecting) ? (
              <input
                name="address"
                value={address}
                onChange={(event) => editAddress(event.target.value)}
                placeholder="Numéro et rue"
                autoComplete="street-address"
                className="text-ink w-full text-[15px] font-semibold outline-none"
              />
            ) : (
              <div className="min-w-0">
                <input type="hidden" name="address" value={address} />
                <div className="text-ink truncate text-[15px] font-semibold">
                  {address || "Localisation en cours…"}
                </div>
                <div className="text-muted mt-0.5 text-xs">
                  {detecting ? "Recherche de l’adresse" : "Détecté par GPS"}
                </div>
              </div>
            )}
            {!editingAddress && address ? (
              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="border-line bg-surface text-brand flex-none cursor-pointer rounded-full border px-3 py-[7px] text-xs font-semibold"
              >
                Modifier
              </button>
            ) : null}
          </div>
          <input
            name="spot"
            placeholder="Précision : devant le portail vert…"
            className="border-line-soft text-ink mt-[11px] w-full border-t pt-[11px] text-sm outline-none"
          />
        </div>

        <SectionTitle>Passage du camion</SectionTitle>
        <ChoiceButtons
          options={PICKUP_CHOICES}
          value={pickup}
          onChange={setPickup}
          layout="blocks"
        />

        <button
          type="button"
          onClick={() => setRule((value) => !value)}
          aria-pressed={rule}
          className={`mt-[18px] flex w-full cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] p-3.5 text-left ${
            rule ? "border-brand bg-brand-tint" : "border-line bg-card"
          }`}
        >
          <span
            className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg border-[1.5px] text-sm font-bold text-white ${
              rule ? "border-brand bg-brand" : "border-line-disabled bg-card"
            }`}
          >
            {rule ? "✓" : ""}
          </span>
          <span className="text-ink text-[13px]/[1.45] font-semibold">
            Je dépose dans le cadre prévu par ma ville (jour et lieu de collecte autorisés).{" "}
            <span className="text-danger">Obligatoire</span>
          </span>
        </button>

        {state.error ? (
          <p role="alert" className="text-danger mt-3 text-[13px] font-semibold">
            {state.error}
          </p>
        ) : null}
      </div>

      <div className="border-line-soft bg-surface wide:px-6 wide:pb-[22px] flex-none border-t px-5 pt-3 pb-5">
        <button
          type="submit"
          disabled={!ready || pending}
          className={`font-display wide:h-[54px] h-14 w-full rounded-[18px] text-[17px] font-bold text-white ${
            ready && !pending
              ? "bg-brand hover:bg-brand-hover cursor-pointer"
              : "bg-btn-disabled cursor-not-allowed"
          }`}
        >
          {pending ? "Publication…" : "Publier sur la carte"}
        </button>
      </div>
    </form>
  );
}
