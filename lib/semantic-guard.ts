export type SemanticIssue = {
  type: "number" | "quotation" | "protected-term" | "acronym";
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
  text.match(/(?<![\p{L}\p{N}])[\p{Lu}]{2,}[\p{Lu}\d]*(?![\p{L}\p{N}])/gu) || [];

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
  const outputNormalized = normalize(rewritten);
  originalQuotes.forEach((value) => {
    if (!outputNormalized.includes(value)) {
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

  return { valid: issues.length === 0, issues };
}

export function formatSemanticIssues(issues: SemanticIssue[]): string {
  return issues.map((issue) => "- " + issue.message + ": " + issue.value).join("\n");
}
