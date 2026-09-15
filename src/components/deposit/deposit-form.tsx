"use client";

import imageCompression from "browser-image-compression";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { publishListing } from "@/app/(app)/deposer/actions";
import type { DepositState } from "@/lib/deposit";
import { ChoiceButtons } from "@/components/deposit/choice-buttons";
import { ZoneChoice } from "@/components/deposit/zone-choice";
import { useNeighborhood } from "@/components/shell/neighborhood-context";
import { FINE_EUROS, LIMITS, WEEE_NOTICE, type Zone } from "@/lib/collection";
import { COMMUNE, isInsideCommune, locationRestricted } from "@/lib/commune";
import { CATEGORIES, CONDITIONS, type Category, type Condition } from "@/lib/types";

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
  const { center, located, geo, requestGeo } = useNeighborhood();

  /**
   * C'est ici que la position se justifie : elle remplit l'adresse et vérifie
   * la commune. On la demande donc à l'ouverture du formulaire, et non à
   * l'arrivée sur le site où elle se ferait refuser par réflexe.
   */
  useEffect(() => {
    if (geo === "idle") requestGeo();
  }, [geo, requestGeo]);
  const [state, formAction, pending] = useActionState<DepositState, FormData>(publishListing, {});

  const [category, setCategory] = useState<Category>("Meubles");
  const [condition, setCondition] = useState<Condition>("Correct");
  const [zone, setZone] = useState<Zone>("Ville");

  // La zone ne change pas d'un dépôt à l'autre : on évite de la redemander.
  // Appliquée après le premier rendu, sinon le serveur et le navigateur
  // n'afficheraient pas la même date de collecte.
  useEffect(() => {
    const saved = window.localStorage.getItem("ratrape.zone");
    if (saved !== "Ville" && saved !== "Parc") return;
    const timer = setTimeout(() => setZone(saved), 0);
    return () => clearTimeout(timer);
  }, []);

  const pickZone = (next: Zone) => {
    setZone(next);
    window.localStorage.setItem("ratrape.zone", next);
  };
  const [rule, setRule] = useState(false);

  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [detecting, setDetecting] = useState(true);
  const addressTouched = useRef(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  /**
   * Réduction avant envoi : une photo de téléphone pèse plusieurs mégaoctets,
   * inenvoyable en 4G depuis le trottoir. Le réencodage supprime au passage les
   * métadonnées EXIF, dont la position GPS de la prise de vue.
   */
  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPreparing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.8,
      });
      setPhoto(new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(compressed);
      });
    } catch {
      setPhoto(null);
    } finally {
      setPreparing(false);
    }
  };

  // L'adresse suit la position tant que l'habitant ne l'a pas corrigée lui-même.
  useEffect(() => {
    if (addressTouched.current || !located) return;
    const controller = new AbortController();
    setDetecting(true);
    reverseGeocode(center.lat, center.lng, controller.signal)
      .then((found) => {
        if (!addressTouched.current) setAddress(found);
      })
      .catch(() => undefined)
      .finally(() => setDetecting(false));
    return () => controller.abort();
  }, [center, located]);

  const editAddress = (value: string) => {
    addressTouched.current = true;
    setAddress(value);
  };

  // Sans position réelle, le centre de repli est celui de la commune : publier
  // placerait l'objet devant la mairie, avec une adresse qui n'est pas la sienne.
  const outside = located && locationRestricted() && !isInsideCommune(center);
  const ready =
    rule && address.trim().length >= 3 && photo !== null && !preparing && !outside && located;

  return (
    <form
      action={(formData) => {
        if (photo) formData.set("photo", photo, photo.name);
        return formAction(formData);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="condition" value={condition} />
      <input type="hidden" name="zone" value={zone} />
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
        {!located ? (
          <div className="bg-notice text-notice-ink mb-3 rounded-2xl px-3.5 py-3 text-[13px]/[1.45] font-semibold">
            {geo === "pending"
              ? "Recherche de votre position…"
              : "Ratrape a besoin de votre position pour poser l’objet sur la carte et vérifier qu’il est bien à Maisons-Laffitte."}
            {geo === "denied" || geo === "unavailable" ? (
              <button
                type="button"
                onClick={requestGeo}
                className="text-brand mt-1.5 block cursor-pointer font-bold underline underline-offset-2"
              >
                Autoriser la localisation
              </button>
            ) : null}
          </div>
        ) : null}

        {outside ? (
          <p className="bg-notice text-notice-ink mb-3 rounded-2xl px-3.5 py-3 text-[13px]/[1.45] font-semibold">
            Ratrape ne couvre que {COMMUNE.name} pour le moment, et vous êtes en dehors de la
            commune. Vous pouvez regarder la carte, mais pas publier d’annonce.
          </p>
        ) : null}
        <label
          className={`swatch-photo-zone border-line-disabled wide:h-[140px] relative flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[18px] border-[1.5px] ${
            preview ? "border-solid" : "border-dashed"
          }`}
        >
          {preview ? (
            <>
              {/* Aperçu local, jamais encore envoyé au serveur. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Aperçu de la photo choisie"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="bg-surface/90 text-ink font-display relative rounded-full px-3 py-1.5 text-[13px] font-bold">
                {preparing ? "Préparation…" : "Changer la photo"}
              </span>
            </>
          ) : (
            <>
              <span className="font-display text-ink text-[15px] font-bold">
                {preparing ? (
                  "Préparation…"
                ) : (
                  <>
                    <span className="wide:hidden">Prendre une photo</span>
                    <span className="wide:inline hidden">Ajouter une photo</span>
                  </>
                )}
              </span>
              <span className="text-muted font-mono text-[11px] font-semibold">
                photo de l’objet sur le trottoir
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => pickPhoto(event.target.files?.[0])}
          />
        </label>

        <SectionTitle>Type d’objet</SectionTitle>
        <ChoiceButtons
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
          layout="pills"
        />

        <p className="text-muted mt-2 text-xs/[1.45]">{WEEE_NOTICE}</p>

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

        <SectionTitle>Zone de collecte</SectionTitle>
        <ZoneChoice value={zone} onChange={pickZone} />

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
            Je sors l’objet la veille au soir de la collecte de ma zone, devant chez moi. {LIMITS}{" "}
            Un dépôt hors de ces règles est puni de {FINE_EUROS} € d’amende.{" "}
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
