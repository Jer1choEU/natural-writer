import { assessEditorialCandidate, introducedCliches, sufficientlyDistinct } from "../lib/rewrite-quality";
import type { QualityJudgeResult } from "../benchmarks/quality-judge";

function check(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const original = "Il Movimento propone più fondi per la sanità. Privilegia il dialogo rispetto all'aumento della spesa militare.";
const good = "Per la sanità, il Movimento chiede più fondi. Sulla politica estera sceglie il dialogo anziché aumentare le spese militari.";
const poor = "La sanità gioca un ruolo chiave. Il Movimento si oppone all'aumento della spesa militare.";

const quality: QualityJudgeResult = {
  fidelity: 9, naturalness: 8.5, rhythm: 8, specificity: 8,
  semanticPrecision: 9, concreteness: 8, antiTics: 9,
  semanticCoverage: 9, structurePreservation: 9, rewriteDepth: 7,
  overall: 8.5, notes: [],
};
const accepted = assessEditorialCandidate(original, good, true, quality);
check(accepted.eligible && accepted.score !== null, "Good faithful rewrite should be eligible");

const drift = assessEditorialCandidate(original, poor, true, { ...quality, semanticPrecision: 6 });
check(!drift.eligible && drift.reason === "fidelity", "Political stance drift should be rejected by the judge gate");

const omitted = assessEditorialCandidate(original, good, true, { ...quality, semanticCoverage: 6 });
check(!omitted.eligible, "Missing a claim must disqualify a rewrite");

const unnatural = assessEditorialCandidate(original, good, true, { ...quality, naturalness: 4.5 });
check(!unnatural.eligible && unnatural.reason === "naturalness", "Artificial output should not be offered");

check(!assessEditorialCandidate(original, good, false, quality).eligible,
  "A deterministic semantic guard failure is always disqualifying");
check(assessEditorialCandidate(original, good, true, null).eligible,
  "Unavailable Gemini judge must not disable the editor");

check(introducedCliches(original, poor) === 1, "Detect new formulaic expressions");
const penalized = assessEditorialCandidate(original, poor, true, quality);
check(penalized.score !== null && accepted.score !== null &&
  penalized.score < accepted.score, "Introduced cliches should lower candidate score");

check(sufficientlyDistinct(0.45, 8, 8.5), "Distinct and faithful alternative accepted");
check(!sufficientlyDistinct(0.85, 9, 9), "Near-duplicate A/B should be rejected");
check(!sufficientlyDistinct(0.4, 6, 9), "Distinct but poor alternative should be rejected");
check(sufficientlyDistinct(0.3, null, 8), "Unavailable judge should not prevent distinct A/B");

console.log("Rewrite editorial selection policy: OK");
