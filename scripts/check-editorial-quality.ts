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
const metrics = analyzeItalianText("Roma è una città. La vita va avanti.");
expect(Number.isFinite(metrics.gulpease), "Gulpease finite");
expect(metrics.sentenceCount === 2, "Sentence segmentation");
expect(identifyEditorialFlags("È importante sottolineare che bisogna fare presto.").length > 0, "Flags");
console.log("Semantic guard and Italian metrics: OK");
