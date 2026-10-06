export type PreferenceLike = {
  original: string;
  preferred: string;
  rejected: string;
};

export type StylePreferenceProfile = {
  sampleCount: number;
  confidence: "none" | "low" | "medium" | "high";
  rewriteDistance: "closer" | "balanced" | "farther";
  lengthPreference: "shorter" | "stable" | "longer";
  sentenceRhythm: "more-segmented" | "stable" | "more-flowing";
  lexicalRegister: "simpler" | "stable" | "more-sophisticated";
  punctuation: {
    fewerColons: boolean;
    fewerSemicolons: boolean;
    fewerDashes: boolean;
    fewerExclamations: boolean;
  };
  scores: {
    preferredSimilarity: number;
    rejectedSimilarity: number;
    preferredLengthRatio: number;
    rejectedLengthRatio: number;
    preferredWordsPerSentence: number;
    rejectedWordsPerSentence: number;
    preferredAverageWordLength: number;
    rejectedAverageWordLength: number;
  };
  signals: string[];
};

function words(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'’\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function bigrams(text: string) {
  const tokens = words(text);
  const result = new Set<string>();
  for (let index = 0; index < tokens.length - 1; index += 1) {
    result.add(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return result;
}

function surfaceSimilarity(aText: string, bText: string) {
  const a = bigrams(aText);
  const b = bigrams(bText);

  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }

  return intersection / new Set([...a, ...b]).size;
}

function sentenceCount(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return 0;

  const matches = cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return Math.max(1, matches.length);
}

function averageWordLength(text: string) {
  const tokens = words(text);
  if (tokens.length === 0) return 0;
  return tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length;
}

function punctuationRate(text: string, pattern: RegExp) {
  const tokenCount = Math.max(words(text).length, 1);
  const matches = text.match(pattern)?.length || 0;
  return (matches / tokenCount) * 100;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Number(value.toFixed(3));
}

function confidenceFor(sampleCount: number): StylePreferenceProfile["confidence"] {
  if (sampleCount <= 0) return "none";
  if (sampleCount === 1) return "low";
  if (sampleCount <= 4) return "medium";
  return "high";
}

export function derivePreferenceProfile(
  examples: PreferenceLike[]
): StylePreferenceProfile {
  const clean = examples.filter(
    (example) =>
      example.original.trim() &&
      example.preferred.trim() &&
      example.rejected.trim()
  );

  const sampleCount = clean.length;

  if (sampleCount === 0) {
    return {
      sampleCount: 0,
      confidence: "none",
      rewriteDistance: "balanced",
      lengthPreference: "stable",
      sentenceRhythm: "stable",
      lexicalRegister: "stable",
      punctuation: {
        fewerColons: false,
        fewerSemicolons: false,
        fewerDashes: false,
        fewerExclamations: false,
      },
      scores: {
        preferredSimilarity: 0,
        rejectedSimilarity: 0,
        preferredLengthRatio: 1,
        rejectedLengthRatio: 1,
        preferredWordsPerSentence: 0,
        rejectedWordsPerSentence: 0,
        preferredAverageWordLength: 0,
        rejectedAverageWordLength: 0,
      },
      signals: [],
    };
  }

  const preferredSimilarity = average(
    clean.map((example) => surfaceSimilarity(example.original, example.preferred))
  );
  const rejectedSimilarity = average(
    clean.map((example) => surfaceSimilarity(example.original, example.rejected))
  );

  const preferredLengthRatio = average(
    clean.map((example) => {
      const originalLength = Math.max(words(example.original).length, 1);
      return words(example.preferred).length / originalLength;
    })
  );
  const rejectedLengthRatio = average(
    clean.map((example) => {
      const originalLength = Math.max(words(example.original).length, 1);
      return words(example.rejected).length / originalLength;
    })
  );

  const preferredWordsPerSentence = average(
    clean.map((example) => {
      const count = sentenceCount(example.preferred);
      return count ? words(example.preferred).length / count : 0;
    })
  );
  const rejectedWordsPerSentence = average(
    clean.map((example) => {
      const count = sentenceCount(example.rejected);
      return count ? words(example.rejected).length / count : 0;
    })
  );

  const preferredAverageWordLength = average(
    clean.map((example) => averageWordLength(example.preferred))
  );
  const rejectedAverageWordLength = average(
    clean.map((example) => averageWordLength(example.rejected))
  );

  const similarityDelta = preferredSimilarity - rejectedSimilarity;
  const rewriteDistance =
    similarityDelta <= -0.04
      ? "farther"
      : similarityDelta >= 0.04
        ? "closer"
        : "balanced";

  const lengthDelta = preferredLengthRatio - 1;
  const lengthPreference =
    lengthDelta <= -0.06
      ? "shorter"
      : lengthDelta >= 0.06
        ? "longer"
        : "stable";

  const rhythmRatio =
    rejectedWordsPerSentence > 0
      ? preferredWordsPerSentence / rejectedWordsPerSentence
      : 1;
  const sentenceRhythm =
    rhythmRatio <= 0.9
      ? "more-segmented"
      : rhythmRatio >= 1.1
        ? "more-flowing"
        : "stable";

  const lexicalDelta =
    preferredAverageWordLength - rejectedAverageWordLength;
  const lexicalRegister =
    lexicalDelta <= -0.12
      ? "simpler"
      : lexicalDelta >= 0.12
        ? "more-sophisticated"
        : "stable";

  const tendency = (pattern: RegExp) => {
    const preferred = average(
      clean.map((example) => punctuationRate(example.preferred, pattern))
    );
    const rejected = average(
      clean.map((example) => punctuationRate(example.rejected, pattern))
    );
    return preferred + 0.15 < rejected;
  };

  const punctuation = {
    fewerColons: tendency(/:/g),
    fewerSemicolons: tendency(/;/g),
    fewerDashes: tendency(/[—–]/g),
    fewerExclamations: tendency(/!/g),
  };

  const signals: string[] = [];

  if (rewriteDistance === "farther") {
    signals.push("preferisce riscritture con maggiore distanza superficiale dall'originale");
  } else if (rewriteDistance === "closer") {
    signals.push("preferisce riscritture più vicine alla formulazione originale");
  }

  if (lengthPreference === "shorter") {
    signals.push("tende a preferire versioni più concise");
  } else if (lengthPreference === "longer") {
    signals.push("tende ad accettare o preferire versioni leggermente più sviluppate");
  }

  if (sentenceRhythm === "more-segmented") {
    signals.push("preferisce periodi più brevi e segmentati");
  } else if (sentenceRhythm === "more-flowing") {
    signals.push("preferisce periodi più ampi e fluidi");
  }

  if (lexicalRegister === "simpler") {
    signals.push("preferisce un lessico più semplice rispetto alle alternative scartate");
  } else if (lexicalRegister === "more-sophisticated") {
    signals.push("accetta un lessico leggermente più sofisticato rispetto alle alternative scartate");
  }

  if (punctuation.fewerColons) signals.push("tende a evitare i due punti");
  if (punctuation.fewerSemicolons) signals.push("tende a evitare il punto e virgola");
  if (punctuation.fewerDashes) signals.push("tende a evitare i trattini lunghi");
  if (punctuation.fewerExclamations) signals.push("tende a evitare i punti esclamativi");

  return {
    sampleCount,
    confidence: confidenceFor(sampleCount),
    rewriteDistance,
    lengthPreference,
    sentenceRhythm,
    lexicalRegister,
    punctuation,
    scores: {
      preferredSimilarity: round(preferredSimilarity),
      rejectedSimilarity: round(rejectedSimilarity),
      preferredLengthRatio: round(preferredLengthRatio),
      rejectedLengthRatio: round(rejectedLengthRatio),
      preferredWordsPerSentence: round(preferredWordsPerSentence),
      rejectedWordsPerSentence: round(rejectedWordsPerSentence),
      preferredAverageWordLength: round(preferredAverageWordLength),
      rejectedAverageWordLength: round(rejectedAverageWordLength),
    },
    signals,
  };
}

export function buildPreferenceProfileRules(profile: StylePreferenceProfile) {
  if (profile.sampleCount === 0 || profile.signals.length === 0) return "";

  const confidenceRule =
    profile.confidence === "low"
      ? "Il profilo deriva da un solo confronto: trattalo come un indizio debole e non forzare il testo per seguirlo."
      : profile.confidence === "medium"
        ? "Il profilo ha confidenza media: applica le tendenze quando non entrano in conflitto con naturalezza e fedeltà."
        : "Il profilo ha confidenza alta: consideralo una preferenza stilistica ricorrente, senza mai sacrificare fedeltà o naturalezza.";

  return [
    `PROFILO STILISTICO AGGREGATO — ${profile.sampleCount} confronti, confidenza ${profile.confidence}.`,
    confidenceRule,
    ...profile.signals.map((signal) => `Preferenza osservata: ${signal}.`),
    "Il profilo descrive soltanto tendenze di forma. Non trasferire contenuti, fatti, opinioni o temi dai testi di training.",
    "In caso di conflitto, fedeltà semantica e naturalezza vengono prima del profilo.",
  ].join("\n");
}
