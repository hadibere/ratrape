import Link from "next/link";

/** Page introuvable : hors de la coque du quartier, on se suffit à soi-même. */
export default function NotFound() {
  return (
    <main className="bg-page flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-[430px] text-center">
        <h1 className="font-display text-ink text-[26px]/[1.15] font-bold">Page introuvable</h1>
        <p className="text-muted mt-2.5 text-[15px]/[1.5]">
          Cette adresse ne mène à rien. L’annonce a peut-être été retirée par son déposant.
        </p>
        <Link
          href="/"
          className="border-line bg-card font-display text-ink mt-[22px] flex h-[52px] items-center justify-center rounded-2xl border-[1.5px] text-base font-bold"
        >
          Retour à la carte
        </Link>
      </div>
    </main>
  );
}
