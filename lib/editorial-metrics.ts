export type LinguisticMetrics = {
  gulpease: number;
  lexicalDiversity: number;
  sentenceLengthStdDev: number;
  avgWordLength: number;
  longSentenceRate: number;
  punctuationDensity: number;
  abstractPhraseHits: number;
  sentenceCount: number;
};

const artificialPhrases = [
  "nel mondo di oggi",
  "in un contesto in continua evoluzione",
  "è importante sottolineare",
  "si configura come",
  "risulta fondamentale",
  "in conclusione",
  "un ruolo cruciale",
  "gioca un ruolo chiave",
  "una priorità fondamentale",
  "sul terreno della",
  "non solo",
  "ma anche",
];

export function analyzeItalianText(text: string): LinguisticMetrics {
  const words = text.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || [];
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const lengths = sentences.map((sentence) => (sentence.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || []).length);
  const avgLength = lengths.length ? lengths.reduce((sum, n) => sum + n, 0) / lengths.length : 0;
  const variance = lengths.length ? lengths.reduce((sum, n) => sum + (n - avgLength) ** 2, 0) / lengths.length : 0;
  const letters = words.join("").length;
  // Gulpease index: 89 + (300 * number of sentences - 10 * number of letters) / number of words.
  const gulpease = words.length ? 89 + (300 * sentences.length - 10 * letters) / words.length : 0;
  const normalized = words.map((word) => word.toLocaleLowerCase("it"));
  const lowered = text.toLocaleLowerCase("it");

  return {
    gulpease: Number(gulpease.toFixed(1)),
    lexicalDiversity: words.length ? Number((new Set(normalized).size / words.length).toFixed(3)) : 0,
    sentenceLengthStdDev: Number(Math.sqrt(variance).toFixed(2)),
    avgWordLength: words.length ? Number((letters / words.length).toFixed(2)) : 0,
    longSentenceRate: lengths.length ? Number((lengths.filter((n) => n > 32).length / lengths.length).toFixed(3)) : 0,
    punctuationDensity: words.length ? Number(((text.match(/[,;:—–]/g) || []).length / words.length).toFixed(3)) : 0,
    abstractPhraseHits: artificialPhrases.reduce((n, phrase) => n + (lowered.includes(phrase) ? 1 : 0), 0),
    sentenceCount: sentences.length,
  };
}

export type EditorialFlag = { sentence: string; reasons: string[] };

/** Explain local issues to the model instead of forcing every sentence to change. */
export function identifyEditorialFlags(text: string): EditorialFlag[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((sentence) => {
      const lowered = sentence.toLocaleLowerCase("it");
      const reasons: string[] = [];
      if (artificialPhrases.some((phrase) => lowered.includes(phrase))) reasons.push("formula convenzionale");
      const words = sentence.match(/[\p{L}]+(?:['’][\p{L}]+)*/gu) || [];
      if (words.length > 36) reasons.push("periodo particolarmente lungo");
      if ((sentence.match(/[,;:]/g) || []).length > 6) reasons.push("punteggiatura molto densa");
      return { sentence, reasons };
    })
    .filter((flag) => flag.reasons.length > 0)
    .slice(0, 8);
}
