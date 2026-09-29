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

const model = process.env.OPENAI_MODEL || "gpt-6-astra";

const antiTicRules = [
  "Evita aperture generiche come 'nel mondo di oggi', 'in un contesto in continua evoluzione', 'è importante sottolineare'.",
  "Riduci costruzioni simmetriche troppo frequenti come 'non solo... ma anche', 'da un lato... dall'altro', 'sia... sia' quando non servono.",
  "Non chiudere ogni paragrafo con una mini-conclusione.",
  "Evita conclusioni riassuntive automatiche se il testo non ne ha bisogno.",
  "Non abusare di avverbi enfatici come 'fondamentale', 'cruciale', 'significativo', 'essenziale'.",
  "Evita sequenze di tre elementi costruite solo per dare ritmo.",
  "Non trasformare automaticamente la prosa in elenchi.",
  "Evita paragrafi tutti della stessa lunghezza.",
  "Evita frasi tutte con la stessa struttura sintattica.",
  "Usa con moderazione i due punti e i trattini lunghi.",
  "Non inserire metafore decorative o slogan se non presenti nello stile richiesto.",
  "Elimina ripetizioni semantiche anche quando usano parole diverse.",
  "Preferisci verbi concreti a nominalizzazioni astratte.",
  "Se una frase breve funziona meglio, usala.",
  "Non rendere il testo artificialmente elegante o perfettamente bilanciato.",
];

function intensityRules(intensity: HumanizeOptions["intensity"]) {
  switch (intensity) {
    case "leggera":
      return [
        "Intervieni il minimo necessario.",
        "Mantieni struttura, ordine dei paragrafi e lessico originale quando funzionano.",
        "Correggi soprattutto rigidità, ripetizioni e passaggi innaturali.",
      ].join(" ");
    case "profonda":
      return [
        "Puoi ristrutturare in modo deciso periodi e paragrafi.",
        "Puoi cambiare ordine locale delle informazioni se il significato resta identico.",
        "Riduci fortemente formule generiche, ripetizioni e simmetrie artificiali.",
        "Mantieni invariati fatti, numeri, nomi, citazioni e tesi.",
      ].join(" ");
    default:
      return [
        "Riscrivi con libertà moderata.",
        "Mantieni riconoscibile la struttura logica originale, ma migliora ritmo e naturalezza.",
      ].join(" ");
  }
}

function modeRules(options: HumanizeOptions) {
  if (options.mode === "professional") {
    return [
      "Mantieni un tono professionale ma non burocratico.",
      "Preferisci chiarezza e precisione a formule formali.",
      "Evita gergo aziendale, parole gonfie e frasi impersonali inutili.",
    ].join(" ");
  }

  if (options.mode === "social") {
    return socialRules(options);
  }

  return [
    "Mantieni una voce naturale e credibile.",
    "Non trasformare il testo in un post, in una mail o in un articolo se non richiesto.",
  ].join(" ");
}

function socialRules(options: HumanizeOptions) {
  if (options.mode !== "social") return "";

  const platformRules: Record<NonNullable<HumanizeOptions["platform"]>, string> = {
    instagram:
      "Per Instagram privilegia leggibilità mobile, paragrafi brevi e una prima riga forte ma non clickbait.",
    facebook:
      "Per Facebook consenti un testo leggermente più discorsivo, con apertura chiara e sviluppo naturale.",
    linkedin:
      "Per LinkedIn mantieni un tono professionale e personale, evitando motivational-speak e formule da personal branding.",
    x:
      "Per X comprimi il testo, elimina il superfluo e privilegia una formulazione netta. Non superare il necessario.",
    threads:
      "Per Threads usa un tono conversazionale e diretto, con ritmo rapido e senza formalismi.",
  };

  return [
    `Piattaforma: ${options.platform || "instagram"}.`,
    platformRules[options.platform || "instagram"],
    `Emoji: ${options.emoji ? "consentite, ma solo se aggiungono qualcosa e senza sequenze decorative" : "non usarle"}.`,
    `Call to action: ${options.cta ? "presente, breve e coerente col contenuto" : "non aggiungerla automaticamente"}.`,
    `Domanda finale: ${options.question ? "può esserci, ma solo se nasce davvero dal testo" : "non aggiungerla"}.`,
    "Evita hook artificiosi, frasi motivazionali prefabbricate e chiusure da engagement bait.",
    "Non usare hashtag salvo che siano realmente utili al contenuto.",
  ].join(" ");
}

function buildAnalysisInstructions(options: HumanizeOptions) {
  return [
    "Analizza il testo come un editor umano esperto.",
    "Individua rigidità, ripetizioni, frasi troppo uniformi, transizioni meccaniche, formule generiche, tono impersonale e passaggi che sembrano costruiti più per essere ordinati che naturali.",
    "Segnala anche eventuali tic stilistici: simmetrie troppo perfette, enumerazioni artificiali, conclusioni automatiche, abuso di avverbi enfatici, nominalizzazioni, eccesso di due punti o trattini.",
    "Non giudicare se il testo sia stato scritto da una IA e non cercare di eludere sistemi di rilevazione.",
    `Modalità richiesta: ${options.mode}.`,
    `Intensità: ${options.intensity || "media"}.`,
    "Restituisci un piano di riscrittura molto conciso, massimo 8 punti, senza riscrivere ancora il testo.",
  ].join(" ");
}

function buildRewriteInstructions(options: HumanizeOptions) {
  return [
    "Riscrivi il testo come un editor umano.",
    "Preserva fatti, numeri, nomi propri, citazioni, tesi, posizione dell'autore e significato.",
    "Non aggiungere informazioni, esempi, giudizi o dati non presenti nell'originale.",
    "Mantieni eventuali incertezze o cautele dell'originale: non renderle più forti o più deboli.",
    "Varia in modo naturale lunghezza e struttura delle frasi.",
    "Usa lessico concreto e contestuale.",
    "Non correggere una voce personale solo perché è irregolare: correggi ciò che suona meccanico, non ciò che suona umano.",
    ...antiTicRules,
    intensityRules(options.intensity),
    modeRules(options),
    `Tono richiesto: ${options.tone || "diretto"}.`,
    "Restituisci soltanto il testo riscritto, senza commenti, note, intestazioni o spiegazioni.",
  ].join(" ");
}

function buildReviewInstructions(options: HumanizeOptions) {
  return [
    "Sei il revisore finale.",
    "Confronta originale e bozza frase per frase sul piano del significato.",
    "Ripristina qualunque fatto, numero, nome, citazione, sfumatura o rapporto causale alterato.",
    "Rimuovi qualsiasi aggiunta non supportata dall'originale.",
    "Controlla che il testo non sia diventato troppo levigato, simmetrico o prevedibile.",
    "Se due frasi consecutive hanno struttura o ritmo troppo simili, rendile più naturali senza introdurre nuove informazioni.",
    "Rimuovi ridondanze residue e formule generiche.",
    "Mantieni la modalità e il tono richiesti.",
    intensityRules(options.intensity),
    modeRules(options),
    "Restituisci esclusivamente la versione finale pronta all'uso.",
  ].join(" ");
}

export async function humanizeText(text: string, options: HumanizeOptions) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const analysis = await client.responses.create({
    model,
    instructions: buildAnalysisInstructions(options),
    input: text,
  });

  const draft = await client.responses.create({
    model,
    instructions: buildRewriteInstructions(options),
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
    instructions: buildReviewInstructions(options),
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
      mode: options.mode,
      intensity: options.intensity || "media",
      platform: options.mode === "social" ? options.platform || "instagram" : null,
    },
  };
}
