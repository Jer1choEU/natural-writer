import type { QualityJudgeResult } from "../benchmarks/quality-judge";

/**
 * Selection policy, independent of Gemini and the database.
 * Meaning and attribution outweigh fluency. A failed judge must not take down
 * writing, but an explicit negative assessment must not be ignored either.
 */
export type EditorialAssessment = {
  eligible: boolean;
  score: number | null;
  reason: "ok" | "semantic-guard" | "fidelity" | "naturalness" | "judge-unavailable";
};

const cliches = [
  "gioca un ruolo chiave",
  "riveste un ruolo fondamentale",
  "una priorità fondamentale",
  "sul terreno della",
  "il traguardo finale",
  "è importante sottolineare",
  "risulta fondamentale",
  "si configura come",
];

export function introducedCliches(original: string, rewritten: string): number {
  const source = original.toLocaleLowerCase("it");
  const output = rewritten.toLocaleLowerCase("it");
  return cliches.filter((phrase) => output.includes(phrase) && !source.includes(phrase)).length;
}

export function assessEditorialCandidate(
  original: string,
  rewritten: string,
  semanticGuardPassed: boolean,
  quality: QualityJudgeResult | null
): EditorialAssessment {
  if (!semanticGuardPassed) return { eligible: false, score: null, reason: "semantic-guard" };
  if (!quality) return { eligible: true, score: null, reason: "judge-unavailable" };

  // Conservative hard stops: an attractive paraphrase cannot outrank a faithful
  // text when the judge detects a meaningful loss of subject, scope or meaning.
  if (Math.min(quality.fidelity, quality.semanticPrecision, quality.semanticCoverage) < 7.2) {
    return { eligible: false, score: null, reason: "fidelity" };
  }
  if (quality.naturalness < 5.5 || quality.concreteness < 5) {
    return { eligible: false, score: null, reason: "naturalness" };
  }

  // Coverage was previously absent from the selection score. Reweight it
  // alongside naturalness, accuracy and the judgment of overall editorial gain.
  const score = quality.overall * 0.17
    + quality.fidelity * 0.17
    + quality.semanticPrecision * 0.19
    + quality.semanticCoverage * 0.19
    + quality.naturalness * 0.17
    + quality.concreteness * 0.06
    + quality.antiTics * 0.05
    - introducedCliches(original, rewritten) * 0.55;
  return { eligible: true, score: Number(score.toFixed(3)), reason: "ok" };
}

/** A/B must differ editorially; do not create a fake choice from near-copies. */
export function sufficientlyDistinct(similarity: number, comparedScore: number | null, bestScore: number | null) {
  return similarity < 0.72 && (
    comparedScore === null || bestScore === null || comparedScore >= bestScore - 1.25
  );
}
