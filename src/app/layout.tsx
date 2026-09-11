import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kilajete",
  description:
    "Un encombrant sur le trottoir ? Signalez-le sur la carte du quartier : un voisin peut venir le récupérer avant le passage du camion.",
};

export const viewport: Viewport = {
  themeColor: "#1F7A4D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
