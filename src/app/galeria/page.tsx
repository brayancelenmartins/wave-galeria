import type { Metadata } from "next";
import PageHead from "@/components/ui/PageHead";
import Exhibition from "./Exhibition";

export const metadata: Metadata = { title: "Galeria" };

export default function GaleriaPage() {
  return (
    <>
      <PageHead title="Galeria" />
      <Exhibition />
    </>
  );
}
