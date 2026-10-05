import { getM5SKnowledgeContext } from "../lib/m5s-knowledge";

function ids(text: string) {
  return new Set(getM5SKnowledgeContext(text).matches.map((entry) => entry.id));
}

function assertIncludes(text: string, expected: string[]) {
  const found = ids(text);
  const missing = expected.filter((id) => !found.has(id));
  if (missing.length) {
    throw new Error(`Knowledge retrieval failed for "${text}". Missing: ${missing.join(", ")}. Found: ${[...found].join(", ")}`);
  }
}

function assertEmpty(text: string) {
  const result = getM5SKnowledgeContext(text);
  if (result.matches.length !== 0) {
    throw new Error(`Neutral text unexpectedly matched political knowledge: ${result.matches.map((entry) => entry.id).join(", ")}`);
  }
}

assertIncludes(
  "Serve il salario minimo e bisogna ridurre la precarietà nei contratti a termine.",
  ["diritto-lavoro", "salario-minimo", "contratti-termine"]
);

assertIncludes(
  "Sul riconoscimento della Palestina e sull'obiettivo NATO del 5% del PIL serve una posizione chiara.",
  ["pace-multilateralismo", "palestina-riconoscimento", "no-nato-5-percento"]
);

assertIncludes(
  "Nel quartiere i residenti chiedono più partecipazione e un bilancio partecipativo del Comune.",
  ["cittadinanza-attiva", "democrazia-partecipativa", "bilancio-partecipativo"]
);

assertIncludes(
  "Liste d'attesa troppo lunghe nel SSN e carenza di medici.",
  ["diritto-salute", "liste-attesa", "sanita-risorse-personale"]
);

assertEmpty(
  "La riunione si è svolta martedì mattina e ha coinvolto i responsabili dei tre gruppi di lavoro."
);

console.log("M5S knowledge retrieval checks passed.");
