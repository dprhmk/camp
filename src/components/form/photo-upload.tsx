"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { Camera, Loader2, X, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/**
 * Photo picker with client-side compression (important on weak connections).
 * Uploads to /api/upload and stores the resulting URL in a hidden input so it
 * is submitted with the surrounding form.
 */
export function PhotoUpload({
  name,
  defaultUrl,
}: {
  name: string;
  defaultUrl?: string | null;
}) {
  const [url, setUrl] = React.useState<string | null>(defaultUrl ?? null);
  const [uploading, setUploading] = React.useState(false);
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      const body = new FormData();
      body.append("file", compressed, file.name);
      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Не вдалося завантажити фото");
      }
      const data = await res.json();
      setUrl(data.url);
    } catch (e) {
      toast({ type: "error", message: e instanceof Error ? e.message : "Помилка завантаження" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name={name} value={url ?? ""} />
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Фото учасника" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300">
            <ImagePlus className="size-8" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-brand-600" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Camera className="size-5" />
          {url ? "Змінити фото" : "Додати фото"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl(null)}
            className="inline-flex items-center gap-1 text-sm text-red-600"
          >
            <X className="size-4" />
            Прибрати
          </button>
        )}
      </div>
    </div>
  );
}
