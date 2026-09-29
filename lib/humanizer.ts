import OpenAI from "openai";

export type RewriteMode = "natural" | "professional" | "social";

export type HumanizeOptions = {
  mode: RewriteMode;
  platform?: "instagram" | "facebook" | "linkedin" | "x" | "threads";
  tone?: string;
  intensity?: "leggera" | "media" | "profonda";
  emoji?: boolean;
  cta?: boolean;
  question?: boolean;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || "gpt-6-astra";

function socialRules(options: HumanizeOptions) {
  if (options.mode !== "social") return "";

  return [
    `Piattaforma: ${options.platform || "instagram"}.`,
    `Emoji: ${options.emoji ? "consentite, ma solo se naturali" : "non usarle"}.`,
    `Call to action: ${options.cta ? "presente e non artificiale" : "non necessaria"}.`,
    `Domanda finale: ${options.question ? "sì, se coerente con il testo" : "no"}.`,
    "Usa paragrafi brevi, un'apertura forte ma non clickbait e una chiusura naturale.",
  ].join(" ");
}

export async function humanizeText(text: string, options: HumanizeOptions) {
  const analysis = await client.responses.create({
    model,
    instructions: [
      "Analizza il testo come un editor umano esperto.",
      "Individua rigidità, ripetizioni, frasi troppo uniformi, transizioni meccaniche, formule generiche, eccesso di elenchi e tono impersonale.",
      "Non giudicare se il testo sia stato scritto da una IA e non cercare di eludere sistemi di rilevazione.",
      "Restituisci un piano di riscrittura molto conciso, senza riscrivere ancora il testo.",
    ].join(" "),
    input: text,
  });

  const draft = await client.responses.create({
    model,
    instructions: [
      "Riscrivi il testo come un editor umano.",
      "Preserva fatti, numeri, nomi propri, citazioni, tesi e significato.",
      "Non aggiungere informazioni non presenti nel testo originale.",
      "Varia in modo naturale lunghezza e struttura delle frasi.",
      "Elimina formule stereotipate, ridondanze e transizioni artificiali.",
      "Preferisci lessico concreto e contestuale.",
      `Modalità: ${options.mode}.`,
      `Tono: ${options.tone || "diretto"}.`,
      `Intensità: ${options.intensity || "media"}.`,
      socialRules(options),
      "Restituisci soltanto il testo riscritto, senza commenti o intestazioni.",
    ].join(" "),
    input: [
      "TESTO ORIGINALE:",
      text,
      "",
      "PIANO EDITORIALE:",
      analysis.output_text,
    ].join("\n"),
  });

  const finalPass = await client.responses.create({
    model,
    instructions: [
      "Sei il revisore finale.",
      "Confronta originale e bozza.",
      "Correggi qualsiasi alterazione di significato, fatto, numero, nome o sfumatura importante.",
      "Rimuovi eventuali frasi aggiunte che non siano supportate dall'originale.",
      "Mantieni però il risultato naturale, scorrevole e coerente con la modalità richiesta.",
      socialRules(options),
      "Restituisci esclusivamente la versione finale pronta all'uso.",
    ].join(" "),
    input: [
      "ORIGINALE:",
      text,
      "",
      "BOZZA:",
      draft.output_text,
    ].join("\n"),
  });

  return {
    text: finalPass.output_text.trim(),
    meta: {
      model,
      stages: ["analysis", "rewrite", "faithfulness-review"],
    },
  };
}
