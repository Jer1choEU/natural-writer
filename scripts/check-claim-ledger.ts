/**
 * Offline schema / gate regression suite. These fixtures do NOT constitute
 * empirical LLM accuracy measurements; live A/B evaluation is a separate task.
 */
import { parseLedger, parseVerification, sourceChunks } from "../lib/claim-ledger";
import { checkSemanticGuard } from "../lib/semantic-guard";
import { parseEditorialPlan, splitEditorialParagraphs } from "../lib/editorial-plan";

function assert(test: unknown, message: string): asserts test {
  if (!test) throw new Error(message);
}
function rejects(callback: () => unknown, message: string) {
  try { callback(); } catch { return; }
  throw new Error(message);
}
type Fixture = { category: string; source: string; regression: string };
const fixtures: Fixture[] = [
  { category: "political", source: "Il Movimento propone di limitare il consumo di suolo.", regression: "limitare non equivale ad arrestare" },
  { category: "political", source: "La sanità è una delle principali priorità.", regression: "una delle non significa priorità assoluta" },
  { category: "political", source: "Servono maggiori finanziamenti pubblici.", regression: "maggiore è requisito" },
  { category: "political", source: "Il programma prevede più borse di studio.", regression: "più non è eliminabile" },
  { category: "political", source: "Si propone il riconoscimento del matrimonio egualitario.", regression: "riconoscimento è azione" },
  { category: "political", source: "Si chiede una maggiore contribuzione dalle grandi ricchezze.", regression: "contribuzione non è colpire" },
  { category: "political", source: "Il programma indica maggiore autonomia diplomatica.", regression: "maggiore non significa ritrovare" },
  { category: "political", source: "La diplomazia va privilegiata rispetto alle spese militari.", regression: "privilegiare non è opporsi" },
  { category: "political", source: "Il partito chiede di ridurre le liste d'attesa.", regression: "ridurre non equivale a eliminare" },
  { category: "political", source: "Il gruppo propone tutele per i lavoratori precari.", regression: "non attribuire la proposta ai lavoratori" },
  { category: "social", source: "Abbiamo incontrato i residenti in piazza.", regression: "non inventare partecipanti" },
  { category: "social", source: "L'iniziativa partirà soltanto se arriveranno le autorizzazioni.", regression: "preserva condizione" },
  { category: "social", source: "Non abbiamo ancora fissato una data.", regression: "preserva negazione" },
  { category: "social", source: "Vorremmo ascoltare altre proposte.", regression: "vorremmo non è faremo" },
  { category: "social", source: "È possibile che il progetto riparta.", regression: "possibile non è certo" },
  { category: "informative", source: "Il servizio apre il 15 ottobre.", regression: "non cambiare date" },
  { category: "informative", source: "Sono previsti circa 200 utenti.", regression: "circa indica approssimazione" },
  { category: "informative", source: "La fase iniziale comprende solo le funzioni principali.", regression: "solo limita ambito" },
  { category: "informative", source: "I tecnici hanno completato due verifiche su tre.", regression: "non confondere totale e parziale" },
  { category: "informative", source: "Il rapporto attribuisce l'errore al fornitore.", regression: "preserva attribuzione" },
  { category: "institutional", source: "L'ufficio comunica che il termine è prorogato.", regression: "ufficio è soggetto" },
  { category: "institutional", source: "La richiesta deve pervenire entro lunedì.", regression: "entro è vincolo" },
  { category: "institutional", source: "La procedura può essere avviata dagli aventi diritto.", regression: "può non significa deve" },
  { category: "institutional", source: "La misura riguarda esclusivamente gli iscritti.", regression: "esclusivamente è vincolo" },
  { category: "opinion", source: "Ritengo questa proposta utile ma incompleta.", regression: "preserva riserva" },
  { category: "opinion", source: "Non credo che sia la soluzione migliore.", regression: "non è negazione decisiva" },
  { category: "opinion", source: "Preferisco discutere dei costi prima di decidere.", regression: "preferenza non è rifiuto" },
  { category: "already-good", source: "Siamo tornati in piazza per ascoltare i residenti.", regression: "non cambiare per forza" },
  { category: "artificial", source: "In un contesto in continua evoluzione è fondamentale promuovere iniziative.", regression: "elimina formula senza inventare" },
  { category: "long", source: "In primo luogo la scuola riceverà più fondi; inoltre saranno previste nuove borse di studio e ulteriori servizi per gli studenti.", regression: "proteggere tutti i congiunti" },
];

const claimFor = (source: string) => ({
  source, subject: "soggetto", action: "azione", object: "",
  quantity: "", conditions: [], negations: [], certainty: "", intensity: "",
  relations: [], protectedTerms: [], requiredDetails: [],
});

for (const [i, fixture] of fixtures.entries()) {
  const ledger = parseLedger({ claims: [claimFor(fixture.source)] }, fixture.source);
  assert(ledger.claims.length === 1 && ledger.claims[0].id === "C1", "Claim extraction schema " + i);
  const valid = parseVerification({
    checks: [{ id: "C1", status: "preserved", explanation: "", targetExcerpt: "" }],
    addedClaims: [],
  }, ledger);
  assert(valid.valid, "Preserved assertion should pass " + i);
  const regression = parseVerification({
    checks: [{ id: "C1", status: "altered", explanation: fixture.regression, targetExcerpt: "" }],
    addedClaims: [],
  }, ledger);
  assert(!regression.valid, "Semantic alteration must fail " + i);
  const extra = parseVerification({
    checks: [{ id: "C1", status: "preserved", explanation: "", targetExcerpt: "" }],
    addedClaims: ["unsupported addition"],
  }, ledger);
  assert(!extra.valid, "Unsupported addition must fail " + i);
}
const original = "Il gruppo chiede più fondi. Gli iscritti propongono nuove misure.";
const two = parseLedger({ claims: [
  claimFor("Il gruppo chiede più fondi."),
  claimFor("Gli iscritti propongono nuove misure."),
] }, original);
rejects(() => parseLedger({ claims: [claimFor("An invented statement")] }, original),
  "Source excerpts must occur literally");
rejects(() => parseLedger({ claims: [] }, original), "An empty ledger must fail");
rejects(() => parseVerification({
  checks: [{ id: "C1", status: "preserved" }], addedClaims: [],
}, two), "Partial verification must fail");
rejects(() => parseVerification({
  checks: [{ id: "C1", status: "preserved" }, { id: "C1", status: "preserved" }], addedClaims: [],
}, two), "Duplicate verification must fail");
rejects(() => parseVerification({
  checks: [{ id: "C1", status: "unknown" }, { id: "C2", status: "preserved" }], addedClaims: [],
}, two), "Unknown status must fail");
rejects(() => parseVerification({
  checks: [{ id: "C1", status: "preserved" }, { id: "C2", status: "preserved" }],
}, two), "Missing added-claims verification must fail");
const longSource = fixtures.map((x) => x.source).join("\n\n").repeat(7);
const chunks = sourceChunks(longSource, 350);
assert(chunks.length > 3, "Long sources must be segmented");
assert(chunks.join(" ").replace(/\s+/g, " ") === longSource.replace(/\s+/g, " "),
  "Chunking must not drop text");
assert(!checkSemanticGuard("Entro il 15 ottobre", "Entro il 16 ottobre").valid,
  "Known number regression must fail deterministic guard");
assert(!checkSemanticGuard("Il M5S propone fondi", "Il partito propone fondi").valid,
  "Acronym regression must fail deterministic guard");


const planSource = "La prima frase va bene.\n\nNel contesto attuale risulta fondamentale intervenire.";
assert(splitEditorialParagraphs(planSource).length === 2, "Two input paragraphs expected");
const plan = parseEditorialPlan({
  paragraphs: [
    { id: "P1", action: "keep", reason: "già chiaro" },
    { id: "P2", action: "rebuild", reason: "formula stereotipata" },
  ], transitions: [], repeatedOpenings: [], structureNotes: [],
}, 2);
assert(plan.paragraphs[0].action === "keep" && plan.paragraphs[1].action === "rebuild",
  "Plan must support keep and rebuild decisions");
rejects(() => parseEditorialPlan({
  paragraphs: [{ id: "P1", action: "keep", reason: "ok" }],
  transitions: [], repeatedOpenings: [], structureNotes: [],
}, 2), "A plan missing a paragraph must fail");
rejects(() => parseEditorialPlan({
  paragraphs: [{ id: "P1", action: "delete", reason: "arbitrario" }],
  transitions: [], repeatedOpenings: [], structureNotes: [],
}, 1), "Unknown action must fail");

console.log("Claim ledger schema, 30 fixtures, independent checks, guards and editorial plan: OK");
