import { checkSemanticGuard } from "../lib/semantic-guard";
import { analyzeItalianText, identifyEditorialFlags } from "../lib/editorial-metrics";

function expect(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}
const original = 'Il GT M5S ha stanziato 1.200 euro a Roma il 23 ottobre 2026.';
expect(checkSemanticGuard(original, original).valid, "Identical text must be valid");
expect(!checkSemanticGuard(original, original.replace("1.200", "1.300")).valid, "Changed amount");
expect(!checkSemanticGuard(original, original.replace("M5S", "PD")).valid, "Changed acronym");
expect(!checkSemanticGuard(original, original + " Il totale è 900.").valid, "Added amount");
expect(!checkSemanticGuard("Il progetto Roma Capitale resta attivo.", "Il progetto resta attivo.", ["Roma Capitale"]).valid,
  "Protected phrase removed");
const quote = 'Ha dichiarato: «Siamo pronti».';
expect(!checkSemanticGuard(quote, 'Ha dichiarato: «Non siamo pronti».').valid,
  "Quote changed");
expect(checkSemanticGuard(quote, quote).valid, "Unchanged quote");
// Political scope and degree: high-confidence negative regressions should be blocked.
const limit = "Il programma vuole limitare il consumo di suolo.";
check(!checkSemanticGuard(limit, "Il programma vuole arrestare il consumo di suolo.").valid,
  "Limiting soil consumption must not turn into stopping it");
check(checkSemanticGuard(limit, "Il programma vuole ridurre il consumo di suolo.").valid,
  "Equivalent lower-strength scope should be permitted");
check(!checkSemanticGuard("La riduzione delle liste d'attesa è una priorità.",
  "Abbattere le liste d'attesa è una priorità.").valid, "Do not intensify waiting-list policy");
check(!checkSemanticGuard("Vogliamo la trasparenza delle istituzioni.",
  "Vogliamo la massima trasparenza delle istituzioni.").valid, "Do not add absolute modifiers");
check(!checkSemanticGuard("Serve una maggiore autonomia diplomatica.",
  "L'Europa deve ritrovare autonomia diplomatica.").valid, "Do not invent lost autonomy");
check(!checkSemanticGuard("Il Movimento privilegia il dialogo rispetto all'aumento delle spese militari.",
  "Il Movimento si oppone all'aumento delle spese militari.").valid, "Preference is not absolute opposition");
check(checkSemanticGuard("Il piano vuole arrestare il consumo di suolo.",
  "L'obiettivo è arrestare il consumo di suolo.").valid, "Already strong language must not be blocked");

const metrics = analyzeItalianText("Roma è una città. La vita va avanti.");
expect(Number.isFinite(metrics.gulpease), "Gulpease finite");
expect(metrics.sentenceCount === 2, "Sentence segmentation");
expect(identifyEditorialFlags("È importante sottolineare che bisogna fare presto.").length > 0, "Flags");
console.log("Semantic guard and Italian metrics: OK");
