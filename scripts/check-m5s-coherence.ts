import {
  buildM5SCoherenceEvidence,
  checkM5SPoliticalCoherence,
  deriveM5SCoherenceOverall,
} from "../lib/m5s-coherence";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const workEvidence = buildM5SCoherenceEvidence(
  "Serve il salario minimo legale e bisogna ridurre la precarietà."
);
assert(
  workEvidence.entries.some((entry) => entry.id === "salario-minimo"),
  "Coherence evidence must retrieve salario-minimo."
);

const foreignEvidence = buildM5SCoherenceEvidence(
  "Sono contrario al riconoscimento della Palestina e favorevole al 5% NATO."
);
assert(
  foreignEvidence.entries.some((entry) => entry.id === "palestina-riconoscimento"),
  "Coherence evidence must retrieve Palestine policy."
);
assert(
  foreignEvidence.entries.some((entry) => entry.id === "no-nato-5-percento"),
  "Coherence evidence must retrieve NATO 5% policy."
);

assert(
  deriveM5SCoherenceOverall([
    { classification: "carta-coerente" },
    { classification: "nova-coerente" },
  ]) === "coerente",
  "Compatible findings should derive overall=coerente."
);

assert(
  deriveM5SCoherenceOverall([
    { classification: "nova-coerente" },
    { classification: "in-tensione" },
  ]) === "misto",
  "Mixed findings should derive overall=misto."
);

const neutral = await checkM5SPoliticalCoherence(
  "La riunione si è svolta martedì mattina e ha coinvolto i responsabili dei tre gruppi di lavoro."
);
assert(
  neutral.overall === "non-determinabile" && neutral.modelUsed === false,
  "Neutral text must be non-determinabile without calling the model."
);

console.log("M5S political coherence checks passed.");
