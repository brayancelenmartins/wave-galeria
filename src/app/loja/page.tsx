import type { Metadata } from "next";
import { Suspense } from "react";
import Shop from "./Shop";

export const metadata: Metadata = { title: "Loja" };

export default function LojaPage() {
  return (
    <Suspense><Shop /></Suspense>
  );
}
