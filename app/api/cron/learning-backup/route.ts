import { timingSafeEqual } from "node:crypto";
import { gzipSync } from "node:zlib";
import { put } from "@vercel/blob";
import { configuredLearningOwnerId } from "@/lib/learning-auth";
import { exportLearning, learningDatabaseConfigured } from "@/lib/learning-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeBearer(request: Request) {
  const token = process.env.CRON_SECRET;
  if (!token || token.length < 16) return false;
  const supplied = request.headers.get("authorization") || "";
  const a = Buffer.from(supplied);
  const b = Buffer.from("Bearer " + token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!safeBearer(request)) return Response.json({ error: "Non autorizzato." }, { status: 401 });
  if (!learningDatabaseConfigured()) return Response.json({ error: "Database non configurato." }, { status: 503 });
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return Response.json({ error: "Backup privato Blob non collegato." }, { status: 503 });
  }
  try {
    const owner = configuredLearningOwnerId();
    const data = await exportLearning(owner);
    const compressed = gzipSync(Buffer.from(JSON.stringify(data)));
    const date = new Date().toISOString().slice(0, 10);
    await put("natural-writer/learning-backups/" + date + ".json.gz", compressed, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/gzip",
    });
    return Response.json({ saved: true, date, bytes: compressed.byteLength }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Scheduled private learning backup failed", error);
    return Response.json({ error: "Backup non riuscito." }, { status: 503 });
  }
}
