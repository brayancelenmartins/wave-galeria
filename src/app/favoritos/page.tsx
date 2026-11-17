"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHead from "@/components/ui/PageHead";
import ArtCard from "@/components/art/ArtCard";
import { useCatalog } from "@/store/catalog";
import { useFavorites } from "@/store/favorites";

export default function FavoritosPage() {
  const ids = useFavorites((s) => s.ids);
  const list = useCatalog((s) => s.artworks).filter((a) => ids.includes(a.id));
  return (
    <>
      <PageHead title="Favoritos" />
      <div className="container-site pb-24">
        {list.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">{list.map((a) => <ArtCard key={a.id} art={a} />)}</div>
        ) : (
          <div className="py-10">
            <p className="mb-6 text-ink-soft">Você ainda não salvou nenhuma obra. Toque no coração de uma obra para guardá-la aqui.</p>
            <Link href="/loja" className="btn-solid">Explorar a loja <ArrowRight size={16} className="arrow" /></Link>
          </div>
        )}
      </div>
    </>
  );
}
