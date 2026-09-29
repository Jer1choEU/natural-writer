export type TextMetrics = {
  characters: number;
  words: number;
  sentences: number;
  avgSentenceWords: number;
  paragraphCount: number;
  repeatedOpenings: number;
  genericPhraseHits: number;
  excessiveEmphasisHits: number;
};

const genericPhrases = [
  "nel mondo di oggi",
  "in un contesto",
  "è importante sottolineare",
  "è fondamentale",
  "è cruciale",
  "non solo",
  "ma anche",
  "in conclusione",
  "in definitiva",
  "vale la pena",
];

const emphasis = [
  "fondamentale",
  "cruciale",
  "essenziale",
  "significativo",
  "straordinario",
  "incredibile",
];

export function analyzeText(text: string): TextMetrics {
  const normalized = text.trim();
  const words = normalized ? normalized.split(/\s+/).filter(Boolean) : [];
  const sentences = normalized
    ? normalized.split(/[.!?]+(?:\s|$)/).map((s) => s.trim()).filter(Boolean)
    : [];
  const paragraphs = normalized
    ? normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const openings = sentences
    .map((s) => s.toLowerCase().split(/\s+/).slice(0, 2).join(" "))
    .filter(Boolean);
  const openingCounts = new Map<string, number>();
  for (const opening of openings) {
    openingCounts.set(opening, (openingCounts.get(opening) || 0) + 1);
  }

  const repeatedOpenings = [...openingCounts.values()].filter((count) => count > 1).length;
  const lower = normalized.toLowerCase();

  return {
    characters: normalized.length,
    words: words.length,
    sentences: sentences.length,
    avgSentenceWords: sentences.length ? Number((words.length / sentences.length).toFixed(2)) : 0,
    paragraphCount: paragraphs.length,
    repeatedOpenings,
    genericPhraseHits: genericPhrases.reduce(
      (sum, phrase) => sum + (lower.includes(phrase) ? 1 : 0),
      0
    ),
    excessiveEmphasisHits: emphasis.reduce(
      (sum, word) => sum + (lower.includes(word) ? 1 : 0),
      0
    ),
  };
}

export function heuristicScore(original: TextMetrics, rewritten: TextMetrics) {
  let score = 100;

  const lengthRatio = original.words ? rewritten.words / original.words : 1;
  if (lengthRatio < 0.55 || lengthRatio > 1.8) score -= 18;
  else if (lengthRatio < 0.7 || lengthRatio > 1.5) score -= 8;

  if (rewritten.genericPhraseHits > original.genericPhraseHits) score -= 12;
  if (rewritten.excessiveEmphasisHits > original.excessiveEmphasisHits) score -= 10;
  if (rewritten.repeatedOpenings > original.repeatedOpenings) score -= 8;

  if (rewritten.avgSentenceWords > 32) score -= 8;
  if (rewritten.avgSentenceWords < 5 && rewritten.sentences > 2) score -= 5;

  return Math.max(0, score);
}
