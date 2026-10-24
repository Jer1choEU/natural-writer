import { eventFeatures, profileFromAggregates } from "../lib/learning-profile";
import { sanitizeEvent } from "../lib/learning-store";
import { derivePreferenceProfile } from "../lib/preference-profile";

const test = (condition: boolean, msg: string) => { if (!condition) throw new Error(msg); };

const choice = sanitizeEvent({
  kind: "choice", mode: "social",
  original: "È fondamentale sottolineare il tema.",
  preferred: "Parliamo del problema.",
  rejected: "È importante evidenziare questa questione.",
  createdAt: "2026-10-24T12:00:00.000Z",
});
test(Boolean(choice), "choice accepted");
if (!choice) throw Error("missing event");
test(choice.weight === 1 && choice.mode === "social", "choice weighting and mode");
test(sanitizeEvent({ kind: "edit", mode: "natural", original: "Prima", preferred: "Dopo" })?.weight === 2,
  "real manual edit is a stronger preference");
test(sanitizeEvent({ kind: "edit", original: "Stesso", preferred: "Stesso" }) === null,
  "unchanged output is never an edit signal");
test(sanitizeEvent({ kind: "import", preferred: "corto" }) === null,
  "too short authentic sample rejected");

const metrics = eventFeatures(choice);
test(metrics.preferredLengthRatio > 0, "style statistics finite");
const raw = derivePreferenceProfile([choice]);
test(raw.sampleCount === 1, "baseline profile");
const built = profileFromAggregates(12, metrics);
test(built.profile.sampleCount === 12, "cumulative count not limited to 50");
test(built.profile.confidence === "high", "profile confidence");
const empty = profileFromAggregates(0, {});
test(empty.profile.confidence === "none", "empty profile");

console.log("Persistent learning profile regression: OK");
