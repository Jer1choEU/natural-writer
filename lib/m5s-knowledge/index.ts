import { M5S_PRINCIPLES } from "./principles";
import { M5S_POLICIES_2026 } from "./positions-2026";
import { M5S_KNOWLEDGE_SOURCES, M5S_SOURCE_BY_ID } from "./sources";
import type { M5SKnowledgeEntry } from "./types";

export {
  M5S_KNOWLEDGE_SOURCES,
  M5S_PRINCIPLES,
  M5S_POLICIES_2026,
};
export type {
  M5SKnowledgeAuthority,
  M5SKnowledgeEntry,
  M5SKnowledgeSource,
} from "./types";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9%\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(text: string, entry: M5SKnowledgeEntry) {
  const normalizedTitle = normalize(entry.title);
  let score = normalizedTitle && text.includes(normalizedTitle) ? 6 : 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    if (text.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(" ") ? 4 : 2;
    }
  }

  if (entry.status === "foundational") score += score > 0 ? 1 : 0;
  return score;
}

function rankMatches(text: string, entries: M5SKnowledgeEntry[], limit: number) {
  const normalized = normalize(text);
  return entries
    .map((entry) => ({ entry, score: scoreEntry(normalized, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

export function getM5SKnowledgeContext(text: string) {
  const principles = rankMatches(text, M5S_PRINCIPLES, 5);
  const policies = rankMatches(text, M5S_POLICIES_2026, 8);
  const matches = [...principles, ...policies];

  if (matches.length === 0) {
    return {
      context: "",
      matches: [] as M5SKnowledgeEntry[],
      sourceIds: [] as string[],
    };
  }

  const sourceIds = [...new Set(matches.flatMap((entry) => entry.sourceIds))];
  const lines = matches.map((entry) => {
    const source = M5S_SOURCE_BY_ID.get(entry.sourceIds[0]);
    const authority =
      entry.status === "foundational"
        ? "PRINCIPIO FONDANTE"
        : entry.status === "member-approved-policy"
          ? "POSIZIONE DELIBERATA DAGLI ISCRITTI"
          : "CONTESTO ORGANIZZATIVO";

    return `- [${authority}] ${entry.title}: ${entry.summary} Fonte: ${source?.title || entry.sourceIds.join(", ")}.`;
  });

  const context = [
    "CONTESTO POLITICO UFFICIALE M5S PERTINENTE AL TESTO:",
    "Questo contesto serve esclusivamente a evitare errori concettuali, attribuzioni improprie e slittamenti di significato.",
    "Nella normale riscrittura NON aggiungere al testo posizioni, proposte, slogan o argomenti politici qui elencati se non sono già presenti nell'originale.",
    "Se l'originale esprime una posizione diversa o critica verso il M5S, preservala fedelmente: non correggerla in silenzio.",
    "Distingui sempre principi fondanti della Carta da posizioni politiche deliberate successivamente.",
    ...lines,
  ].join("\n");

  return { context, matches, sourceIds };
}
