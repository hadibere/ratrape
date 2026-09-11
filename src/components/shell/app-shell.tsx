import type { ReactNode } from "react";

type AppShellProps = {
  /** Carte persistante, visible uniquement à partir de 900 px. */
  map?: ReactNode;
  /** Contenu du panneau : colonne centrée sur mobile, panneau latéral sur desktop. */
  children: ReactNode;
};

/**
 * Coque de l'application, bascule unique à 900 px.
 *
 * - Sous 900 px : une seule colonne centrée (max 430 px) sur le fond de page.
 * - À partir de 900 px : la carte occupe la place restante à gauche et le
 *   panneau de 420 px se colle à droite. Le panneau n'est monté qu'une fois,
 *   la carte reste montée d'un écran à l'autre.
 */
export function AppShell({ map, children }: AppShellProps) {
  return (
    <div className="bg-page wide:justify-start flex h-dvh min-h-0 flex-1 justify-center">
      <div className="bg-map wide:block relative hidden min-w-0 flex-1 overflow-hidden">{map}</div>
      <div className="border-line bg-surface wide:w-[420px] wide:max-w-none wide:flex-none wide:border-r-0 flex w-full max-w-[430px] min-w-0 flex-col border-x">
        {children}
      </div>
    </div>
  );
}
