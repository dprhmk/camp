import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

// Next's production server only serves files from `public/` that existed at
// build time, so runtime-uploaded photos 404 there. Stream them from disk via
// this route instead (works in dev and prod alike).

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;

  // Allow only plain file names (no path traversal).
  if (!/^[a-zA-Z0-9._-]+$/.test(name) || name.includes("..")) {
    return NextResponse.json({ error: "Невірне імʼя файлу" }, { status: 400 });
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  if (!type) return NextResponse.json({ error: "Непідтримуваний формат" }, { status: 400 });

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не знайдено" }, { status: 404 });
  }
}
