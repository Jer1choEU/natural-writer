import { analyzeItalianText } from "@/lib/editorial-metrics";
import { derivePreferenceProfile, type StylePreferenceProfile } from "@/lib/preference-profile";

export type LearningKind = "choice" | "edit" | "import";
export type LearningMode = "social" | "natural";
export type LearningEvent = {
  kind: LearningKind;
  mode: LearningMode | "general";
  original: string;
  preferred: string;
  rejected: string;
  createdAt: string;
  weight: number;
};

export const STAT_FIELDS = [
  "preferredSimilarity", "rejectedSimilarity", "preferredLengthRatio", "rejectedLengthRatio",
  "preferredWordsPerSentence", "rejectedWordsPerSentence", "preferredAverageWordLength",
  "rejectedAverageWordLength", "fewerColons", "fewerSemicolons",
  "fewerDashes", "fewerExclamations",
] as const;

export type StatField = typeof STAT_FIELDS[number];
export type LearningStats = Record<StatField, number>;

export function eventFeatures(event: LearningEvent): LearningStats {
  const p = derivePreferenceProfile([event]);
  return {
    ...p.scores,
    fewerColons: Number(p.punctuation.fewerColons),
    fewerSemicolons: Number(p.punctuation.fewerSemicolons),
    fewerDashes: Number(p.punctuation.fewerDashes),
    fewerExclamations: Number(p.punctuation.fewerExclamations),
  };
}

export function importFeatures(text: string) {
  const m = analyzeItalianText(text);
  return { gulpease: m.gulpease, sentenceLengthStdDev: m.sentenceLengthStdDev,
    lexicalDiversity: m.lexicalDiversity, avgWordLength: m.avgWordLength };
}

const round = (x: number) => Number(x.toFixed(3));

/** Weighted aggregate of every recorded event, not the last 50. */
export function profileFromAggregates(
  count: number,
  stats: Partial<LearningStats>,
  imported: { count: number; gulpease: number; sentenceLengthStdDev: number } = {
    count: 0, gulpease: 0, sentenceLengthStdDev: 0,
  },
) {
  const profile: StylePreferenceProfile = derivePreferenceProfile([]);
  profile.sampleCount = count;
  profile.confidence = count === 0 ? "none" : count === 1 ? "low" : count < 5 ? "medium" : "high";
  const value = (key: StatField) => stats[key] ?? 0;
  profile.scores = {
    preferredSimilarity: round(value("preferredSimilarity")),
    rejectedSimilarity: round(value("rejectedSimilarity")),
    preferredLengthRatio: round(value("preferredLengthRatio")),
    rejectedLengthRatio: round(value("rejectedLengthRatio")),
    preferredWordsPerSentence: round(value("preferredWordsPerSentence")),
    rejectedWordsPerSentence: round(value("rejectedWordsPerSentence")),
    preferredAverageWordLength: round(value("preferredAverageWordLength")),
    rejectedAverageWordLength: round(value("rejectedAverageWordLength")),
  };
  const distance = value("preferredSimilarity") - value("rejectedSimilarity");
  profile.rewriteDistance = count === 0 || Math.abs(distance) < 0.04 ? "balanced" : distance < 0 ? "farther" : "closer";
  const length = value("preferredLengthRatio") - 1;
  profile.lengthPreference = count === 0 || Math.abs(length) < 0.06 ? "stable" : length < 0 ? "shorter" : "longer";
  const rhythm = value("rejectedWordsPerSentence") ?
    value("preferredWordsPerSentence") / value("rejectedWordsPerSentence") : 1;
  profile.sentenceRhythm = count === 0 || (rhythm > 0.9 && rhythm < 1.1) ?
    "stable" : rhythm <= 0.9 ? "more-segmented" : "more-flowing";
  const lexical = value("preferredAverageWordLength") - value("rejectedAverageWordLength");
  profile.lexicalRegister = count === 0 || Math.abs(lexical) < 0.12 ?
    "stable" : lexical < 0 ? "simpler" : "more-sophisticated";
  profile.punctuation = {
    fewerColons: count >= 3 && value("fewerColons") > 0.65,
    fewerSemicolons: count >= 3 && value("fewerSemicolons") > 0.65,
    fewerDashes: count >= 3 && value("fewerDashes") > 0.65,
    fewerExclamations: count >= 3 && value("fewerExclamations") > 0.65,
  };
  const signals: string[] = [];
  if (profile.rewriteDistance === "closer") signals.push("preferisce conservare la formulazione quando funziona");
  if (profile.rewriteDistance === "farther") signals.push("accetta ristrutturazioni sintattiche più ampie quando migliorano il testo");
  if (profile.lengthPreference === "shorter") signals.push("preferisce versioni concise");
  if (profile.lengthPreference === "longer") signals.push("preferisce un maggiore sviluppo senza ripetizioni");
  if (profile.sentenceRhythm === "more-segmented") signals.push("preferisce periodi più brevi");
  if (profile.sentenceRhythm === "more-flowing") signals.push("preferisce periodi più fluidi");
  if (profile.lexicalRegister === "simpler") signals.push("preferisce parole quotidiane e semplici");
  if (profile.lexicalRegister === "more-sophisticated") signals.push("accetta un lessico più ricco quando è appropriato");
  if (profile.punctuation.fewerColons) signals.push("usa pochi due punti");
  if (profile.punctuation.fewerSemicolons) signals.push("usa raramente il punto e virgola");
  if (profile.punctuation.fewerDashes) signals.push("preferisce evitare i trattini lunghi");
  if (profile.punctuation.fewerExclamations) signals.push("preferisce pochi punti esclamativi");
  if (imported.count >= 3) {
    signals.push("Gli esempi autentici forniti dall'autore sono riferimenti stilistici, non fonti fattuali.");
  }
  profile.signals = signals;
  return { profile, importCount: imported.count };
}
