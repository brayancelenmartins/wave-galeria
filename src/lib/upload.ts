"use client";
import { supabase } from "./supabase";

/** Maior lado da imagem guardada. No modo demonstração fica menor para caber no navegador. */
const MAX_SIDE_REMOTE = 2400;
const MAX_SIDE_LOCAL = 1400;
const MAX_FILE_MB = 40;

const HEIC = /\.(heic|heif)$/i;
const IMAGE_EXT = /\.(jpe?g|jfif|png|webp|gif|bmp|avif|svg|ico|heic|heif)$/i;

export class UploadError extends Error {}

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

export const isImageFile = (f: File) => f.type.startsWith("image/") || IMAGE_EXT.test(f.name);

/** Fotos HEIC/HEIF (iPhone) são convertidas para JPEG antes, pois Chrome e Edge não as abrem. */
async function toDecodable(file: File): Promise<Blob> {
  if (/image\/hei[cf]/i.test(file.type) || HEIC.test(file.name)) {
    try {
      const heic2any = (await import("heic2any")).default;
      const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
      return Array.isArray(out) ? out[0] : out;
    } catch {
      throw new UploadError("Não foi possível converter esta foto HEIC. Tente exportá-la como JPG.");
    }
  }
  return file;
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(src); resolve(img); };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new UploadError("O navegador não conseguiu abrir este arquivo. Use JPG, PNG, WEBP, GIF, AVIF ou HEIC."));
    };
    img.src = src;
  });
}

const toBlob = (c: HTMLCanvasElement, type: string, q: number) => new Promise<Blob | null>((r) => c.toBlob(r, type, q));

/**
 * Abre qualquer imagem que o navegador decodifique (e HEIC), corrige a rotação da câmera,
 * reduz para no máximo `maxSide` e converte para WEBP (ou JPEG, se o navegador não gerar WEBP).
 */
async function prepare(file: File, maxSide: number) {
  const img = await loadImage(await toDecodable(file));
  const w0 = img.naturalWidth || 1200;
  const h0 = img.naturalHeight || 1200;
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new UploadError("Não foi possível processar a imagem.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  let blob = await toBlob(canvas, "image/webp", 0.86);
  if (!blob || blob.type !== "image/webp") {
    // JPEG não tem transparência: fundo cor de papel
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#f7f4ec";
    ctx.fillRect(0, 0, width, height);
    blob = await toBlob(canvas, "image/jpeg", 0.88);
  }
  if (!blob) throw new UploadError("Não foi possível processar a imagem.");
  return { blob, width, height };
}

const readAsDataURL = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new UploadError("Não foi possível ler a imagem."));
    r.readAsDataURL(b);
  });

/** Envia a imagem de uma obra. Com Supabase vai para o bucket `obras`; sem ele fica no navegador. */
export async function uploadArtworkImage(file: File): Promise<UploadedImage> {
  if (!isImageFile(file)) throw new UploadError("Escolha um arquivo de imagem.");
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new UploadError(`A imagem passa de ${MAX_FILE_MB} MB.`);

  const { blob, width, height } = await prepare(file, supabase ? MAX_SIDE_REMOTE : MAX_SIDE_LOCAL);

  if (!supabase) return { url: await readAsDataURL(blob), width, height };

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${new Date().getFullYear()}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("obras").upload(path, blob, {
    contentType: blob.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("bucket")) throw new UploadError("Armazenamento de imagens não configurado no Supabase: rode o arquivo supabase/storage.sql.");
    if (msg.includes("security") || msg.includes("unauthorized") || msg.includes("403")) throw new UploadError("Sem permissão para enviar imagens. Entre de novo no /admin.");
    throw new UploadError(`Falha ao enviar a imagem: ${error.message}`);
  }
  return { url: supabase.storage.from("obras").getPublicUrl(path).data.publicUrl, width, height };
}

/** Formato da moldura a partir das proporções da imagem. */
export function orientationOf(width: number, height: number): "retrato" | "paisagem" | "quadrado" {
  const r = width / height;
  if (r > 1.12) return "paisagem";
  if (r < 0.89) return "retrato";
  return "quadrado";
}
