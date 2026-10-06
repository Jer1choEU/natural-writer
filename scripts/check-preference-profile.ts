import assert from "node:assert/strict";
import {
  buildPreferenceProfileRules,
  derivePreferenceProfile,
} from "../lib/preference-profile";

const examples = [
  {
    original:
      "Il progetto deve cambiare davvero le frasi mantenendo intatto il significato e senza aggiungere informazioni nuove.",
    preferred:
      "Senza aggiungere nulla, il progetto deve riscrivere sul serio ogni frase ma conservarne esattamente il significato.",
    rejected:
      "Il progetto deve davvero cambiare le frasi mantenendo intatto il significato, senza aggiungere informazioni nuove.",
  },
  {
    original:
      "Vogliamo un testo diretto, naturale e semplice, evitando formule troppo costruite e passaggi inutilmente solenni.",
    preferred:
      "Il testo deve suonare semplice e diretto. Niente formule costruite o passaggi solenni senza motivo.",
    rejected:
      "Vogliamo un testo diretto, naturale e semplice: bisogna evitare formule troppo costruite e passaggi inutilmente solenni.",
  },
  {
    original:
      "La riscrittura deve restare fedele ai fatti, ma deve anche allontanarsi abbastanza dalla formulazione originale.",
    preferred:
      "I fatti non si toccano. La forma, invece, deve cambiare abbastanza da sembrare davvero una nuova stesura.",
    rejected:
      "La riscrittura deve restare fedele ai fatti: deve però allontanarsi abbastanza dalla formulazione originale.",
  },
];

const profile = derivePreferenceProfile(examples);

assert.equal(profile.sampleCount, 3);
assert.equal(profile.confidence, "medium");
assert.equal(profile.rewriteDistance, "farther");
assert.notEqual(profile.signals.length, 0);

const rules = buildPreferenceProfileRules(profile);
assert.match(rules, /PROFILO STILISTICO AGGREGATO/);
assert.match(rules, /confidenza medium/);
assert.match(rules, /distanza superficiale/);

const empty = derivePreferenceProfile([]);
assert.equal(empty.sampleCount, 0);
assert.equal(empty.confidence, "none");
assert.equal(buildPreferenceProfileRules(empty), "");

console.log("Preference profile check: OK");
