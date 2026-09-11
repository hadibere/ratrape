import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

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
    <html lang="fr" className={`${quicksand.variable} ${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
