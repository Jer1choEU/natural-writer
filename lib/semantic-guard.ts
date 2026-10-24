export type SemanticIssue = {
  type: "number" | "quotation" | "protected-term" | "acronym" | "scope";
  value: string;
  message: string;
};

export type SemanticGuardResult = {
  valid: boolean;
  issues: SemanticIssue[];
};

/** Deterministic checks complement, but do not replace, semantic evaluation. */
const normalize = (value: string) =>
  value.normalize("NFKC").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim().toLocaleLowerCase("it");

const numbers = (text: string) =>
  (text.match(/(?<![\p{L}\p{N}])\d+(?:[.,]\d+)*(?:\s?[%€])?/gu) || []).map((match) => {
    const cleaned = match.replace(/\s/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "");
    return cleaned.replace(/,(?=\d{3}(?:\D|$))/g, "");
  });

const quoted = (text: string) => {
  const found: string[] = [];
  for (const expression of [/“([^”]+)”/gu, /«([^»]+)»/gu, /"([^"]+)"/gu]) {
    for (const match of text.matchAll(expression)) {
      if (match[1].trim()) found.push(normalize(match[1]));
    }
  }
  return found;
};

const acronyms = (text: string) =>
  text.match(/(?<![\p{L}\p{N}])[\p{Lu}][\p{Lu}\d]*[\p{Lu}\d](?![\p{L}\p{N}])/gu) || ([] as string[]);

const differences = (original: string[], rewritten: string[]) => {
  const remaining = [...rewritten];
  const missing: string[] = [];
  for (const item of original) {
    const index = remaining.findIndex((other) => normalize(other) === normalize(item));
    if (index < 0) missing.push(item);
    else remaining.splice(index, 1);
  }
  return { missing, extra: remaining };
};


/**
 * High-confidence Italian shifts of scope or intensity. This is intentionally
 * narrow: approximate semantic alignment and synonyms belong to the AI judge,
 * while a deterministic guard should only block well-defined regressions.
 */
const scopeRegressions: Array<{
  source: RegExp;
  target: RegExp;
  label: string;
}> = [
  {
    source: /\b(?:limitare|limitando|ridurre|riducendo)\s+(?:il\s+)?consumo\s+di\s+suolo\b/u,
    target: /\b(?:arrestare|azzerare|eliminare)\s+(?:(?:del tutto|completamente)\s+)?(?:il\s+)?consumo\s+di\s+suolo\b/u,
    label: "Limitare il consumo di suolo non equivale ad arrestarlo o azzerarlo",
  },
  {
    source: /\b(?:riduzione|ridurre)\s+(?:delle|le)\s+liste\s+d'attesa\b/u,
    target: /\b(?:abbattere|azzerare|eliminare)\s+(?:completamente\s+)?le\s+liste\s+d'attesa\b/u,
    label: "Ridurre le liste d'attesa non autorizza ad abbatterle o eliminarle",
  },
  {
    source: /\btrasparenza\s+delle\s+istituzioni\b/u,
    target: /\bmassima\s+trasparenza\s+delle\s+istituzioni\b/u,
    label: "Trasparenza non significa automaticamente massima trasparenza",
  },
  {
    source: /\bmaggiore\s+autonomia\s+diplomatica\b/u,
    target: /\britrovare\s+(?:una?\s+)?autonomia\s+diplomatica\b/u,
    label: "Maggiore autonomia non implica un'autonomia precedente perduta",
  },
  {
    source: /\b(?:privilegiando|privilegia|preferisce)\b.{0,135}\brispetto\s+all'aumento\s+delle\s+spese\s+militari\b/u,
    target: /\b(?:opponendosi|opporsi|si oppone)\b.{0,80}\ball'aumento\s+delle\s+spese\s+militari\b/u,
    label: "Preferire il dialogo all'aumento delle spese non implica opposizione categorica",
  },
];

function scopeShiftIssues(original: string, rewritten: string): string[] {
  const source = normalize(original);
  const target = normalize(rewritten);
  return scopeRegressions
    .filter((rule) => rule.source.test(source) && rule.target.test(target) && !rule.target.test(source))
    .map((rule) => rule.label);
}

export function checkSemanticGuard(
  original: string,
  rewritten: string,
  lockedTerms: string[] = []
): SemanticGuardResult {
  const issues: SemanticIssue[] = [];
  const add = (type: SemanticIssue["type"], value: string, message: string) => {
    if (!issues.some((issue) => issue.type === type && issue.value === value)) {
      issues.push({ type, value, message });
    }
  };

  const numberDiff = differences(numbers(original), numbers(rewritten));
  numberDiff.missing.forEach((value) => add("number", value, "Numero o data originale modificato o rimosso"));
  numberDiff.extra.forEach((value) => add("number", value, "Numero non presente nell'originale"));

  const originalQuotes = quoted(original);
  const rewrittenQuotes = quoted(rewritten);
  const outputNormalized = normalize(rewritten);
  originalQuotes.forEach((value) => {
    if (rewrittenQuotes.length ? !rewrittenQuotes.includes(value) : !outputNormalized.includes(value)) {
      add("quotation", value, "Citazione originale non conservata letteralmente");
    }
  });

  for (const term of lockedTerms.map((term) => term.trim()).filter(Boolean)) {
    if (!normalize(rewritten).includes(normalize(term))) {
      add("protected-term", term, "Termine protetto non preservato");
    }
  }

  // Explicit acronyms are usually names of institutions, projects or organizations.
  for (const acronym of new Set(acronyms(original))) {
    if (!acronyms(rewritten).includes(acronym)) {
      add("acronym", acronym, "Sigla originale modificata o rimossa");
    }
  }

  scopeShiftIssues(original, rewritten).forEach((value) => add("scope", value, "Rafforzamento o cambiamento di ambito della proposta"));

  return { valid: issues.length === 0, issues };
}

export function formatSemanticIssues(issues: SemanticIssue[]): string {
  return issues.map((issue) => "- " + issue.message + ": " + issue.value).join("\n");
}
