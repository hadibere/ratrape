"use client";

import Link from "next/link";
import { useState } from "react";

type DepositDoneProps = {
  /** Phrase construite à partir du type d'objet et de la date de collecte. */
  sentence: string;
  /** Adresse lisible, affichée et copiée : « ratrape.fr/g/8K2-PLM ». */
  manageUrl: string;
  /** Chemin interne correspondant, pour ouvrir la page sans quitter le site. */
  managePath: `/g/${string}`;
};

export function DepositDone({ sentence, manageUrl, managePath }: DepositDoneProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(manageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center p-6 text-center">
      <div className="bg-brand font-display wide:mb-[18px] wide:h-[84px] wide:w-[84px] wide:text-[38px] mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full text-[40px] font-bold text-white">
        ✓
      </div>
      <h1 className="font-display text-ink wide:text-2xl text-[26px]/[1.15] font-bold">
        Votre annonce est en ligne
      </h1>
      <p className="text-muted mt-2.5 text-[15px]/[1.5]">{sentence}</p>

      <div className="border-line bg-card wide:mt-5 mt-[22px] rounded-2xl border p-3.5 text-left">
        <div className="text-label text-[11px] font-semibold tracking-[0.06em] uppercase">
          Votre lien de gestion
        </div>
        <Link
          href={managePath}
          className="text-brand mt-1.5 block font-mono text-[13px] font-semibold break-all underline-offset-2 hover:underline"
        >
          {manageUrl}
        </Link>
        <p className="text-muted mt-2 text-xs/[1.45]">
          Gardez ce lien pour modifier ou retirer l’annonce. Aucun compte, aucun mot de passe.
        </p>
      </div>

      <div className="wide:mt-5 mt-[22px] flex flex-col gap-2.5">
        <button
          type="button"
          onClick={copy}
          className="bg-brand font-display hover:bg-brand-hover wide:h-[50px] h-[52px] cursor-pointer rounded-2xl text-base font-bold text-white"
        >
          {copied ? "Lien copié" : "Copier le lien"}
        </button>
        <Link
          href="/"
          className="border-line bg-card font-display text-ink wide:h-[50px] flex h-[52px] items-center justify-center rounded-2xl border-[1.5px] text-base font-bold"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  );
}
