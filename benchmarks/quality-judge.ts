import { generateClaudeJson, defaultClaudeJudgeModel } from "@/lib/claude";

export type QualityJudgeResult = {
  fidelity: number;
  naturalness: number;
  rhythm: number;
  specificity: number;
  semanticPrecision: number;
  concreteness: number;
  antiTics: number;
  semanticCoverage: number;
  structurePreservation: number;
  rewriteDepth: number;
  editorialGain: number;
  overall: number;
  notes: string[];
};

const judgeModel = defaultClaudeJudgeModel;

const judgeFields = ["fidelity","naturalness","rhythm","specificity","semanticPrecision",
  "concreteness","antiTics","semanticCoverage","structurePreservation","rewriteDepth","editorialGain","overall"];
const judgeSchema = {
  type: "object",
  properties: {
    ...Object.fromEntries(judgeFields.map((field) => [field, { type: "number" }])),
    notes: { type: "array", items: { type: "string" } },
  },
  required: [...judgeFields,"notes"],
  additionalProperties: false,
};

async function callJudge(prompt: string) {
  return generateClaudeJson<Record<string, unknown>>(
    judgeModel,
    "Sei un revisore indipendente. Restituisci esclusivamente il JSON richiesto nel prompt.",
    prompt,
    judgeSchema,
  );
}

function clampScore(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

export async function judgeRewrite(
  original: string,
  rewritten: string,
  intensity: "leggera" | "media" | "profonda" = "media"
): Promise<QualityJudgeResult> {
  const raw = await callJudge(`
Valuta una riscrittura editoriale confrontandola con l'originale.

Non valutare se il testo "sembra AI". Valuta invece la qualità editoriale reale.
Assegna un punteggio da 0 a 10 per:
- fidelity: preserva fatti, numeri, nomi, tesi, sfumature e grado di certezza;
- naturalness: suona come prosa umana naturale, non rigida o meccanica;
- rhythm: varietà credibile di lunghezza e struttura delle frasi;
- specificity: evita genericità e formulazioni vuote senza inventare dettagli;
- semanticPrecision: conserva esattamente i concetti dell'originale e non usa sinonimi che ne spostano il significato. Controlla con particolare severità ruoli, qualifiche e azioni: termini plausibili ma non equivalenti sono uno slittamento semantico;
- concreteness: mantiene o migliora la concretezza senza rendere il testo più astratto, solenne o letterario dell'originale;
- antiTics: evita simmetrie artificiali, conclusioni automatiche, slogan, terne decorative, enfasi superflua e formule stereotipate;
- semanticCoverage: conserva tutte le informazioni, negazioni, relazioni causali, inviti e sfumature dell'originale senza omissioni;
- structurePreservation: conserva ordine delle idee, funzione dei paragrafi e architettura argomentativa richiesta, anche se cambia la sintassi;
- rewriteDepth: misura quanto la formulazione è stata realmente ricostruita invece di limitarsi a punteggiatura, piccoli sinonimi o spostamenti cosmetici. Non premiare la distanza se produce artificiosità o deriva semantica.
- Non attribuire richieste o proposte a un soggetto diverso da quello originale: «la scuola chiede fondi» non è equivalente a «il Movimento propone fondi per la scuola».
- Non interpretare una preferenza comparativa come opposizione categorica: «privilegia il negoziato rispetto alle spese militari» NON equivale necessariamente a «si oppone alle spese militari».
- Penalizza formule introdotte inutilmente come «gioca un ruolo chiave», «una priorità fondamentale» o personificazioni come «la legalità chiama».
- Valuta anche se la riscrittura costituisce un miglioramento reale in naturalezza e precisione rispetto al testo di partenza; cambiare solo sinonimi non è un miglioramento.
- editorialGain: confronta DIRETTAMENTE la leggibilità della versione riscritta con quella dell'originale: 5 equivale a nessun miglioramento; 0-3 è un peggioramento; 6-8 un miglioramento reale; 9-10 un miglioramento eccezionale. Non premiare più parole diverse.
- Se l'originale ha già un periodo naturale, lasciarlo invariato è corretto. Ma non considerare un miglioramento un testo che cambia soltanto virgole o sinonimi irrilevanti.
- Valuta il testo come insieme: ripetere sistematicamente paragrafi del tipo «In materia...», «Sul piano...», «Nel settore...» non aumenta la naturalezza.
- Registra come difetto semantico il passaggio da «limitare» ad «arrestare», da «riduzione» ad «azzeramento», o da «autonomia maggiore» ad «autonomia perduta» senza fondamento.

Intensità richiesta: ${intensity}.

overall deve riflettere il giudizio complessivo, con fidelity e semanticCoverage come requisiti più importanti.
Per intensità media, una riscrittura quasi identica all'originale non dovrebbe ottenere rewriteDepth superiore a 4.
Per intensità profonda, una riscrittura quasi identica non dovrebbe ottenere rewriteDepth superiore a 3.
Per intensità leggera, non penalizzare una similarità elevata se gli interventi necessari sono stati fatti.
Se c'è una perdita fattuale significativa, overall non può superare 6.
Se ci sono informazioni inventate, overall non può superare 4.
Se un ruolo o una qualifica viene sostituito con un ruolo soltanto plausibile ma non equivalente, semanticPrecision non può superare 8.
Se un'azione generica viene trasformata in una modalità operativa più specifica non dichiarata dall'originale, semanticPrecision non può superare 8.

Restituisci SOLO JSON valido con questa forma:
{
  "fidelity": 0,
  "naturalness": 0,
  "rhythm": 0,
  "specificity": 0,
  "semanticPrecision": 0,
  "concreteness": 0,
  "antiTics": 0,
  "semanticCoverage": 0,
  "structurePreservation": 0,
  "rewriteDepth": 0,
  "editorialGain": 5,
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
    semanticCoverage: clampScore(raw.semanticCoverage),
    structurePreservation: clampScore(raw.structurePreservation),
    rewriteDepth: clampScore(raw.rewriteDepth),
    editorialGain: clampScore(raw.editorialGain ?? 5),
    overall: clampScore(raw.overall),
    notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 3).map(String) : [],
  };
}
