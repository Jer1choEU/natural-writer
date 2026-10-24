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
  "l\u0027orizzonte di riferimento",
  "tale orientamento",
  "a discapito del",
  "caldeggiato",
  "avviene tramite",
  "costituiscono un ulteriore motivo",
];

export function introducedCliches(original: string, rewritten: string): number {
  const source = original.toLocaleLowerCase("it");
  const output = rewritten.toLocaleLowerCase("it");
  return cliches.filter((phrase) => output.includes(phrase) && !source.includes(phrase)).length;
}


/**
 * Detect unchanged full-length source sentences even when they have been
 * rearranged into fewer paragraphs. Soft scoring signal, NOT a fidelity gate.
 * For short texts or already natural texts, similarity alone isn't evidence
 * of poor writing.
 */
export function unchangedLongSentenceShare(original: string, rewritten: string): number {
  const clean = (value: string) => value.toLocaleLowerCase("it")
    .replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim();
  const sentences = original.replace(/\r\n?/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/u)
    .map(clean).filter((sentence) => sentence.length >= 50);
  if (sentences.length < 6) return 0;
  const output = clean(rewritten);
  return sentences.filter((sentence) => output.includes(sentence)).length / sentences.length;
}

/**
 * Opening templates are tracked at paragraph boundaries rather than across
 * the entire text. This is a soft penalty, not a paragraph-count target.
 */
const boilerplateOpening = /^(?:in (?:materia|ambito|politica) |nel settore |nelle relazioni |sul (?:piano|fronte|terreno) |per quanto riguarda |il programma (?:prevede|propone)|l'obiettivo (?:complessivo|finale)|la transizione ecologica (?:gioca|occupa|richiede))/u;

export function templateOpeningCount(text: string): number {
  return text
    .replace(/[’‘]/g, "'")
    .split(/\n\s*\n|\n(?=\p{Lu})/u)
    .map((part) => part.trim().toLocaleLowerCase("it"))
    .filter(Boolean)
    .filter((part) => boilerplateOpening.test(part)).length;
}

export function assessEditorialCandidate(
  original: string,
  rewritten: string,
  semanticGuardPassed: boolean,
  quality: QualityJudgeResult | null
): EditorialAssessment {
  if (!semanticGuardPassed) return { eligible: false, score: null, reason: "semantic-guard" };
  if (!quality) return { eligible: false, score: null, reason: "judge-unavailable" };

  // Conservative hard stops: an attractive paraphrase cannot outrank a faithful
  // text when the judge detects a meaningful loss of subject, scope or meaning.
  if (Math.min(quality.fidelity, quality.semanticPrecision, quality.semanticCoverage) < 7.2) {
    return { eligible: false, score: null, reason: "fidelity" };
  }
  if (quality.naturalness < 5.5 || quality.concreteness < 5 || quality.editorialGain <= 5.5) {
    return { eligible: false, score: null, reason: "naturalness" };
  }

  // Coverage was previously absent from the selection score. Reweight it
  // alongside naturalness, accuracy and the judgment of overall editorial gain.
  const newBoilerplate = Math.max(0, templateOpeningCount(rewritten) - templateOpeningCount(original));
  // A 20-sentence text copied verbatim into five paragraphs is not an editorial gain.
  // Prefer a soft penalty to a hard rejection, preserving already-good sentences.
  const cosmeticCopyPenalty = Math.max(0, unchangedLongSentenceShare(original, rewritten) - 0.55) * 2.5;
  const score = quality.overall * 0.12
    + quality.fidelity * 0.15
    + quality.semanticPrecision * 0.16
    + quality.semanticCoverage * 0.16
    + quality.naturalness * 0.13
    + quality.concreteness * 0.05
    + quality.antiTics * 0.04
    + quality.editorialGain * 0.19
    - introducedCliches(original, rewritten) * 0.55
    - newBoilerplate * 0.2
    - cosmeticCopyPenalty;
  return { eligible: true, score: Number(score.toFixed(3)), reason: "ok" };
}

/** A/B must differ editorially; do not create a fake choice from near-copies. */
export function sufficientlyDistinct(similarity: number, comparedScore: number | null, bestScore: number | null) {
  return similarity < 0.72 && (
    comparedScore === null || bestScore === null || comparedScore >= bestScore - 1.25
  );
}
