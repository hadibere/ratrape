import Link from "next/link";
import type { ReactNode } from "react";

type PanelNoticeProps = {
  title: string;
  children: ReactNode;
  /** Pastille au-dessus du titre : « ✓ » pour une réussite, « · » pour une information. */
  mark?: string;
  tone?: "brand" | "muted";
  action?: { href: "/" | "/deposer"; label: string };
};

/**
 * Écran d'explication occupant le panneau : lien inconnu, objet déjà parti,
 * page introuvable. Toujours une phrase qui dit quoi faire, jamais un cul-de-sac.
 */
export function PanelNotice({
  title,
  children,
  mark,
  tone = "muted",
  action = { href: "/", label: "Retour à la carte" },
}: PanelNoticeProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center p-6 text-center">
      {mark ? (
        <div
          className={`font-display mx-auto mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-full text-[40px] font-bold ${
            tone === "brand" ? "bg-brand text-white" : "bg-brand-soft text-brand"
          }`}
        >
          {mark}
        </div>
      ) : null}
      <h1 className="font-display text-ink text-[26px]/[1.15] font-bold text-pretty">{title}</h1>
      <p className="text-muted mt-2.5 text-[15px]/[1.5]">{children}</p>
      <Link
        href={action.href}
        className="border-line bg-card font-display text-ink mt-[22px] flex h-[52px] items-center justify-center rounded-2xl border-[1.5px] text-base font-bold"
      >
        {action.label}
      </Link>
    </div>
  );
}
