import { AppShell } from "@/components/shell/app-shell";

export default function Home() {
  return (
    <AppShell>
      <header className="flex-none px-5 pt-4 pb-3">
        <h1 className="font-display text-ink text-[21px]/[1.15] font-bold">Kilajete</h1>
        <p className="text-muted mt-0.5 text-[13px]/[1.4]">
          Quartier Saint-Roch · encombrants à récupérer
        </p>
      </header>
    </AppShell>
  );
}
