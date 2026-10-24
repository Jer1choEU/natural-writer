import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import {
  clearLearning, getLearningStatus, learningContext, recordLearningEvents,
  setAutoLearning, exportLearning, restorePreviousLearningProfile,
  resumeAutomaticLearningProfile,
} from "../lib/learning-store";

function check(value: unknown, reason: string) { if (!value) throw new Error(reason); }

async function main() {
  const dbPath = join(tmpdir(), "natural-writer-learning-test-" + randomUUID() + ".sqlite");
  process.env.TURSO_DATABASE_URL = "file:" + dbPath;
  process.env.TURSO_AUTH_TOKEN = "local-test";
  const owner = "test-owner";
  try {
    const event = {
      kind: "choice", mode: "social", original: "Un problema importante per il quartiere.",
      preferred: "Il quartiere ha un problema.", rejected: "Questa problematica riveste cruciale rilevanza.",
      createdAt: "2026-10-24T10:00:00.000Z",
    };
    const first = await recordLearningEvents(owner, [event]);
    check(first.saved === 1, "first choice should be saved");
    const duplicate = await recordLearningEvents(owner, [event]);
    check(duplicate.saved === 0, "duplicate should be ignored");

    await setAutoLearning(owner, true);
    await recordLearningEvents(owner, [{
      kind: "edit", mode: "social", original: "Bisogna fare un intervento significativo.",
      preferred: "Serve intervenire.", createdAt: "2026-10-24T10:01:00.000Z",
    }], true);
    const sample = "Ho scritto queste parole perché ci sono tante persone che ogni mattina attraversano le nostre strade, " +
      "si fermano ai semafori e aspettano autobus che arrivano troppo tardi. È un problema reale e va affrontato.";
    await recordLearningEvents(owner, [{
      kind: "import", mode: "social", preferred: sample,
      createdAt: "2026-10-24T10:02:00.000Z",
    }]);
    const st = await getLearningStatus(owner);
    check(st.count === 3 && st.imports === 1 && st.enabled, "status, imports, consent");
    const context = await learningContext(owner, "social");
    check(context.profile.sampleCount === 2 && context.styleReferences.length === 1,
      "cumulative preferences and authentic references");
    check((await learningContext(owner,"natural")).profile.sampleCount === 0,
      "different modes must not mix");
    const b = await exportLearning(owner);
    check(b.events.length === 3 && b.format === "natural-writer-learning-v1",
      "complete export");

    await recordLearningEvents(owner, [
      { ...event, preferred: "Serve agire sul problema.", createdAt: "2026-10-24T10:03:00Z" },
    ]);
    const rollback = await restorePreviousLearningProfile(owner, "social");
    check(rollback.pinned, "rollback should pin a previous version");
    const pinned = await getLearningStatus(owner);
    check(Boolean(pinned.pinned.social), "pin is persistent");
    await resumeAutomaticLearningProfile(owner, "social");
    check(!Boolean((await getLearningStatus(owner)).pinned.social), "resume should unpin");
    await clearLearning(owner);
    check((await getLearningStatus(owner)).count === 0, "erase removes all history");
    console.log("Learning SQLite integration: OK");
  } finally {
    await unlink(dbPath).catch(() => {});
  }
}
main().catch(error => { console.error(error); process.exit(1); });
