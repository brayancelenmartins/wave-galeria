"use client";
import { useCatalog } from "@/store/catalog";
import ArtCard from "../art/ArtCard";
import Reveal from "../ui/Reveal";

export default function Featured() {
  const artworks = useCatalog((s) => s.artworks);
  const list = artworks.filter((a) => a.featured).slice(0, 6);
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 lg:gap-x-10">
      {list.map((a, i) => <Reveal key={a.id} delay={(i % 3) * 0.08}><ArtCard art={a} /></Reveal>)}
    </div>
  );
}
