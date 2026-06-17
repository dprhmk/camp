import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB (images are compressed client-side)
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Stores an uploaded image on the local filesystem and returns its URL.
 * For production, replace this with Vercel Blob / Cloudflare R2 — only this
 * handler and the returned URL change; the rest of the app is unaffected.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не надано" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Дозволені лише зображення JPG, PNG або WEBP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл завеликий (максимум 6 МБ)" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  // Served via the photo route (Next prod doesn't serve runtime public/ files).
  return NextResponse.json({ url: `/api/photo/${name}` });
}
