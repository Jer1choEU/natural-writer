import { NextResponse } from "next/server";
import { requireLearningOwner, verifyLearningOrigin } from "@/lib/learning-auth";
import {
  clearLearning, getLearningStatus, learningDatabaseConfigured,
  recordLearningEvents, restorePreviousLearningProfile, resumeAutomaticLearningProfile, setAutoLearning,
} from "@/lib/learning-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const reason = error instanceof Error ? error.message : "";
  if (reason === "UNAUTHORIZED") return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  if (reason === "INVALID_ORIGIN") return NextResponse.json({ error: "Origine della richiesta non valida." }, { status: 403 });
  if (reason === "LEARNING_DB_NOT_CONFIGURED") return NextResponse.json({
    configured: false, error: "Collega il database Turso per attivare la memoria cloud.",
  }, { status: 503 });
  if (reason === "AUTO_LEARNING_DISABLED") return NextResponse.json({
    error: "Attiva prima l'Auto-Learning nella pagina Memoria.",
  }, { status: 409 });
  if (reason === "NO_OLDER_PROFILE") return NextResponse.json({ error: "Nessuna versione precedente da ripristinare." }, { status: 409 });
  console.error("Learning API error", error);
  return NextResponse.json({ error: "Memoria cloud temporaneamente non disponibile. I dati locali non vengono cancellati." }, { status: 503 });
}

export async function GET() {
  try {
    const owner = await requireLearningOwner();
    if (!learningDatabaseConfigured()) throw new Error("LEARNING_DB_NOT_CONFIGURED");
    return NextResponse.json(await getLearningStatus(owner), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    verifyLearningOrigin(request);
    const owner = await requireLearningOwner();
    if (!learningDatabaseConfigured()) throw new Error("LEARNING_DB_NOT_CONFIGURED");
    const raw = await request.text();
    if (raw.length > 1_200_000) return NextResponse.json({ error: "Richiesta troppo grande." }, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;

    if (body.action === "settings") {
      if (typeof body.enabled !== "boolean") return NextResponse.json({ error: "Impostazione non valida." }, { status: 400 });
      const enabled = await setAutoLearning(owner, body.enabled);
      return NextResponse.json({ enabled });
    }
    if (body.action === "record" || body.action === "migrate" || body.action === "import") {
      if (!Array.isArray(body.events) || body.events.length === 0 || body.events.length > 50) {
        return NextResponse.json({ error: "Invia da 1 a 50 eventi validi." }, { status: 400 });
      }
      if (body.action === "import" && body.authored !== true) {
        return NextResponse.json({ error: "Conferma che i testi siano stati scritti da te." }, { status: 400 });
      }
      const events = body.events;
      if (body.action === "import" && events.some(e => !e || e.kind !== "import")) {
        return NextResponse.json({ error: "L'importazione accetta soltanto esempi autentici." }, { status: 400 });
      }
      if (body.action === "migrate" && events.some(e => !e || e.kind !== "choice")) {
        return NextResponse.json({ error: "La migrazione richiede confronti A/B validi." }, { status: 400 });
      }
      const automatic = body.action === "record" && body.automatic === true;
      const result = await recordLearningEvents(owner, events, automatic);
      return NextResponse.json({ ...result, configured: true });
    }
    if (body.action === "restore") {
      if (body.mode !== "social" && body.mode !== "natural") {
        return NextResponse.json({ error: "Modalità non valida." }, { status: 400 });
      }
      return NextResponse.json(await restorePreviousLearningProfile(owner, body.mode));
    }
    if (body.action === "resume") {
      if (body.mode !== "social" && body.mode !== "natural")
        return NextResponse.json({ error: "Modalità non valida." }, { status: 400 });
      return NextResponse.json(await resumeAutomaticLearningProfile(owner, body.mode));
    }
    if (body.action === "clear") {
      if (body.confirm !== "ELIMINA") return NextResponse.json({ error: "Conferma richiesta." }, { status: 400 });
      await clearLearning(owner);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Operazione sconosciuta." }, { status: 400 });
  } catch (error) { return errorResponse(error); }
}
