import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Hydrate from "@/store/Hydrate";
import SiteChrome from "@/components/layout/SiteChrome";
import Toast from "@/components/layout/Toast";

export const metadata: Metadata = {
  title: { default: "THE WAVE | Galeria de arte", template: "%s | THE WAVE" },
  description: "Galeria e loja de quadros: edições limitadas e obras originais emolduradas, com envio para todo o Brasil.",
};
export const viewport: Viewport = { themeColor: "#E4DCCA", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Hydrate />
        <SiteChrome>{children}</SiteChrome>
        <Toast />
      </body>
    </html>
  );
}
