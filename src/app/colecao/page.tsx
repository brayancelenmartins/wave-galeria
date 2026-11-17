import type { Metadata } from "next";
import PageHead from "@/components/ui/PageHead";
import WorldCards from "@/components/home/WorldCards";

export const metadata: Metadata = { title: "Coleção" };

export default function ColecaoPage() {
  return (
    <div className="bg-wave-pale pb-24">
      <PageHead title="Choose your world" />
      <div className="container-site"><WorldCards worlds={["japao", "brasil", "usa"]} /></div>
    </div>
  );
}
