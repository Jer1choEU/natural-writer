export type QualityJudgeResult = {
  fidelity: number;
  naturalness: number;
  rhythm: number;
  specificity: number;
  semanticPrecision: number;
  concreteness: number;
  antiTics: number;
  overall: number;
  notes: string[];
};

const judgeModel = process.env.GEMINI_JUDGE_MODEL || "gemini-3.5-flash-lite";

async function callJudge(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${judgeModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
          .trim() || "";

      if (!text) throw new Error("Judge Gemini senza risposta");
      return JSON.parse(text);
    }

    const errorText = await response.text();
    lastError = new Error(`Gemini judge error ${response.status}: ${errorText}`);

    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 4) {
      throw lastError;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
  }

  throw lastError || new Error("Gemini judge error sconosciuto");
}

function clampScore(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

export async function judgeRewrite(original: string, rewritten: string): Promise<QualityJudgeResult> {
  const raw = await callJudge(`
Valuta una riscrittura editoriale confrontandola con l'originale.

Non valutare se il testo "sembra AI". Valuta invece la qualità editoriale reale.
Assegna un punteggio da 0 a 10 per:
- fidelity: preserva fatti, numeri, nomi, tesi, sfumature e grado di certezza;
- naturalness: suona come prosa umana naturale, non rigida o meccanica;
- rhythm: varietà credibile di lunghezza e struttura delle frasi;
- specificity: evita genericità e formulazioni vuote senza inventare dettagli;
- semanticPrecision: conserva esattamente i concetti dell'originale e non usa sinonimi che ne spostano il significato;
- concreteness: mantiene o migliora la concretezza senza rendere il testo più astratto, solenne o letterario dell'originale;
- antiTics: evita simmetrie artificiali, conclusioni automatiche, slogan, terne decorative, enfasi superflua e formule stereotipate.

overall deve riflettere il giudizio complessivo, con fidelity come requisito più importante.
Se c'è una perdita fattuale significativa, overall non può superare 6.
Se ci sono informazioni inventate, overall non può superare 4.

Restituisci SOLO JSON valido con questa forma:
{
  "fidelity": 0,
  "naturalness": 0,
  "rhythm": 0,
  "specificity": 0,
  "semanticPrecision": 0,
  "concreteness": 0,
  "antiTics": 0,
  "overall": 0,
  "notes": ["massimo 3 osservazioni brevi"]
}

ORIGINALE:
${original}

RISCRITTURA:
${rewritten}
`);

  return {
    fidelity: clampScore(raw.fidelity),
    naturalness: clampScore(raw.naturalness),
    rhythm: clampScore(raw.rhythm),
    specificity: clampScore(raw.specificity),
    semanticPrecision: clampScore(raw.semanticPrecision),
    concreteness: clampScore(raw.concreteness),
    antiTics: clampScore(raw.antiTics),
    overall: clampScore(raw.overall),
    notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 3).map(String) : [],
  };
}
