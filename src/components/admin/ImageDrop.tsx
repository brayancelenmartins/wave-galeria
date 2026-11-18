"use client";
import { ImagePlus, Link2, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";
import { isImageFile, uploadArtworkImage, UploadError, type UploadedImage } from "@/lib/upload";

/**
 * Campo de imagem da obra: clique para escolher (no celular abre a galeria de fotos),
 * arraste um arquivo, ou cole com Ctrl+V. Um link continua aceito como alternativa.
 */
export default function ImageDrop({ value, onChange }: { value: string; onChange: (url: string, img?: UploadedImage) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [value]);

  const handle = async (file?: File | null) => {
    if (!file || busy) return;
    setError("");
    if (!isImageFile(file)) return setError("Escolha um arquivo de imagem.");
    setBusy(true);
    try {
      const img = await uploadArtworkImage(file);
      onChange(img.url, img);
    } catch (e) {
      setError(e instanceof UploadError ? e.message : "Não foi possível enviar a imagem. Tente de novo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  // colar imagem copiada (Ctrl+V) enquanto o formulário está aberto
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find(isImageFile);
      if (file) { e.preventDefault(); handle(file); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  return (
    <div>
      <input ref={input} type="file" className="sr-only" tabIndex={-1} aria-hidden
        accept="image/*,.heic,.heif,.avif,.webp" onChange={(e) => handle(e.target.files?.[0])} />

      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(Array.from(e.dataTransfer.files).find(isImageFile) ?? e.dataTransfer.files[0]); }}
        className={cn("relative flex min-h-[220px] items-center justify-center border-2 border-dashed transition-colors",
          over ? "border-wave bg-wave-pale" : "border-ink/25 bg-paper-light", value && !busy && "border-solid")}
      >
        {value && !broken ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Prévia da obra" onError={() => setBroken(true)} className={cn("max-h-72 w-auto max-w-full object-contain p-3", busy && "opacity-30")} />
            {!busy && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button type="button" onClick={() => input.current?.click()} className="flex items-center gap-1.5 bg-navy px-3 py-2 text-xs font-semibold text-paper-light hover:bg-wave">
                  <RefreshCw size={13} /> Trocar
                </button>
                <button type="button" onClick={() => onChange("")} aria-label="Remover imagem" className="grid h-8 w-8 place-items-center bg-paper text-ink hover:bg-sun hover:text-white">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} disabled={busy}
            className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 px-6 text-center text-navy">
            <ImagePlus size={30} strokeWidth={1.5} className="text-wave" />
            <span className="font-semibold">{broken ? "Imagem não encontrada. Escolha outra" : "Escolher imagem"}</span>
            <span className="text-xs text-ink-mute">ou arraste o arquivo aqui</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper-light/70 text-sm font-semibold text-navy" role="status">
            <Loader2 size={24} className="animate-spin" /> Enviando imagem…
          </div>
        )}
      </div>

      {error && <p role="alert" className="mt-2 text-sm font-medium text-sun">{error}</p>}

      <div className="mt-2">
        {showLink ? (
          <input className="field" placeholder="https://… link da imagem" value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value.trim())} autoFocus aria-label="Link da imagem" />
        ) : (
          <button type="button" onClick={() => setShowLink(true)} className="flex items-center gap-1.5 text-xs font-semibold text-wave hover:underline">
            <Link2 size={13} /> Usar um link
          </button>
        )}
      </div>
    </div>
  );
}
