import { getPresetRules, type StylePreset } from "@/lib/style-presets";
import { getM5SStyleRules } from "@/lib/m5s-style";

export type RewriteMode = "natural" | "professional" | "social";

export type HumanizeOptions = {
  mode: RewriteMode;
  platform?: "instagram" | "facebook" | "linkedin" | "x" | "threads";
  tone?: string;
  intensity?: "leggera" | "media" | "profonda";
  emoji?: boolean;
  cta?: boolean;
  question?: boolean;
  preset?: StylePreset;
  model?: string;
};

const defaultModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

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
  "Non sostituire formulazioni semplici e concrete con espressioni più solenni, astratte o da editoriale.",
  "Proteggi il nucleo concettuale delle formulazioni precise, ma non trattare la loro superficie linguistica come intoccabile: se esiste una resa diversa, naturale e perfettamente equivalente, riscrivila.",
  "Non sostituire un concetto preciso con uno soltanto simile: per esempio non cambiare 'sapere' in 'informarsi', 'vedere esseri umani' in 'percezione degli esseri umani' o altri slittamenti semantici analoghi.",
  "Se una frase è già forte e semanticamente netta, conserva ciò che dice e il suo livello di forza, non necessariamente le stesse parole o la stessa costruzione.",
  "Ottieni la differenza soprattutto riscrivendo la frase come unità: cambia costruzione sintattica, attacco, verbo reggente, disposizione di subordinate e ritmo. Evita invece la sostituzione meccanica parola-per-parola con sinonimi.",
  "Se l'originale usa una frase diretta, un imperativo o un invito esplicito che funziona, preservane la forza invece di attenuarlo in formule impersonali.",
  "Non introdurre riferimenti vaghi come 'queste immagini', 'questa realtà', 'questo scenario' se l'originale non li contiene.",
  "Se una frase breve funziona meglio, usala.",
  "Non rendere il testo artificialmente elegante o perfettamente bilanciato.",
  "Mantieni un tetto di sofisticazione lessicale: la riscrittura non deve usare parole più ricercate o astratte dell'originale senza una ragione precisa.",
  "Se l'originale usa un termine concettualmente preciso, non sostituirlo con un sinonimo solo apparentemente equivalente: responsabilità non è scelte individuali, disumanizzazione non è spoliazione di umanità.",
  "Evita nominalizzazioni che raffreddano una frase concreta: preferisci formule come 'smettiamo di vedere le persone' a costruzioni come 'perdita della capacità di riconoscere gli esseri umani' quando il significato è lo stesso.",
  "Non sostituire parole quotidiane con varianti più solenni senza beneficio: per esempio film non deve diventare opera, sapere non deve diventare conoscere, resta addosso non deve diventare lascia il segno solo per variare.",
  "Considera alcune parole o espressioni dell'originale come ancore semantiche: se sono centrali, naturali e precise, puoi lasciarle identiche anche in una riscrittura sostanziale.",
  "Preserva emoji, simboli e piccoli elementi espressivi dell'originale quando sono coerenti con il contesto; non rimuoverli automaticamente.",
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
        "Obiettivo dell'intensità media: produrre una vera riscrittura, non una semplice revisione dell'originale.",
        "Mantieni la stessa struttura logica: stesso ordine delle idee, stessa funzione dei paragrafi, stessi rapporti tra causa, conseguenza, contrasto, esempio e conclusione.",
        "La forma linguistica, invece, deve cambiare in modo percepibile. Riscrivi le frasi come unità di senso, non parola per parola.",
        "Nella maggior parte delle frasi non banali modifica almeno uno o due elementi tra: attacco, verbo principale, costruzione sintattica, ordine interno dei complementi, coordinazione o subordinazione, segmentazione del periodo.",
        "Puoi mantenere identiche le ancore semantiche davvero precise, i nomi, i termini tecnici e le espressioni che perderebbero significato se parafrasate; tutto il resto può essere riformulato se resta naturale.",
        "Evita di conservare intere frasi soltanto perché sono già corrette: se puoi esprimere esattamente la stessa idea in una forma diversa e altrettanto naturale, fallo.",
        "Non inseguire sinonimi: una buona riscrittura nasce da una nuova costruzione della frase, non dalla sostituzione lessicale meccanica.",
        "Mantieni per quanto possibile il numero e l'ordine dei paragrafi; spezza o unisci periodi solo all'interno dello stesso blocco logico quando migliora il ritmo.",
        "Il risultato deve essere chiaramente riconoscibile come una nuova formulazione, pur dicendo la stessa cosa con la stessa voce, lo stesso livello di enfasi e la stessa architettura argomentativa.",
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
    options.platform ? `Piattaforma: ${options.platform}.` : "Destinazione: social media, senza adattamento a una piattaforma specifica.",
    options.platform ? platformRules[options.platform] : "Privilegia leggibilità mobile, paragrafi brevi, ritmo naturale e una formulazione diretta, senza hook artificiosi o stile da piattaforma specifica.",
    `Emoji: ${options.emoji ? "puoi mantenerle e, solo se davvero utili, aggiungerne con moderazione" : "non aggiungerne di nuove; conserva però quelle già presenti nell'originale se coerenti"}.`,
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
    "Prima di proporre modifiche, individua le ancore semantiche: fatti, concetti precisi, termini chiave, grado di certezza, tono e rapporti logici che non devono cambiare.",
    "Per ogni paragrafo ricostruisci mentalmente la sua ossatura: quali idee contiene e in quale ordine. Proteggi questa ossatura, non la formulazione letterale.",
    "Per intensità media, individua come riformulare realmente la maggior parte delle frasi non banali cambiandone la costruzione senza alterare l'ordine delle idee o il lessico concettualmente indispensabile.",
    "Tratta come segnali d'allarme formule più editoriali o astratte dell'originale, come 'l'opera', 'la narrazione', 'il nodo centrale', 'si tratta di', 'è importante', 'lavoro cinematografico', quando il testo di partenza usa parole più semplici.",
    "Non giudicare se il testo sia stato scritto da una IA e non cercare di eludere sistemi di rilevazione.",
    `Modalità richiesta: ${options.mode}.`,
    `Intensità: ${options.intensity || "media"}.`,
    getM5SStyleRules(),
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
    "Correggi la punteggiatura quando migliora chiarezza e ritmo, anche se il lessico resta invariato.",
    "Usa le virgole per isolare correttamente incisi e complementi inseriti nel mezzo della frase, ma non aggiungerle in modo decorativo.",
    "Se un inciso come 'dietro sigle e numeri' o 'di fronte a certe testimonianze' interrompe il flusso della frase, valuta se racchiuderlo tra virgole.",
    "Usa due punti, punto e virgola e punto fermo solo quando rendono più leggibile il periodo; evita accumuli eccessivi.",
    "Usa lessico concreto e contestuale.",
    "Non correggere una voce personale solo perché è irregolare: correggi ciò che suona meccanico, non ciò che suona umano.",
    "Conserva la macrostruttura del testo, ma non imitare la sintassi dell'originale frase per frase.",
    "Parafrasa per unità di senso: prima comprendi l'idea completa, poi esprimila di nuovo con una costruzione autonoma e naturale.",
    "Quando puoi scegliere tra una bozza quasi identica e una formulazione diversa ma semanticamente equivalente, preferisci la seconda se resta semplice, precisa e credibile.",
    ...antiTicRules,
    intensityRules(options.intensity),
    modeRules(options),
    getPresetRules(options.preset),
    getM5SStyleRules(),
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
    "Non preservare una formulazione della bozza solo perché è diversa: se introduce uno slittamento di significato, artificiosità o perdita di precisione, correggila.",
    "La fedeltà riguarda contenuto, tono, rapporti logici e precisione concettuale, non la conservazione della stessa superficie verbale.",
    "Se la bozza è semanticamente fedele e naturale, non ripristinare automaticamente la frase originale soltanto perché era già ben scritta: mantieni la riformulazione.",
    "Controlla che la bozza non abbia reso più astratto, solenne o editoriale un passaggio che nell'originale era semplice e diretto.",
    "Se una parola o espressione originale è un'ancora semantica precisa, mantienila quando sostituirla produrrebbe un significato meno esatto; altrimenti è lecito riformulare la frase senza conservarne la stessa superficie.",
    "Verifica che ogni sostituzione lessicale conservi esattamente il concetto, non soltanto un significato vicino.",
    "Controlla esplicitamente che la bozza non abbia alzato il registro rispetto all'originale: se è diventata più astratta, solenne o letteraria, riportala a una formulazione semplice e concreta.",
    "Individua le ancore semantiche dell'originale, cioè termini o frasi particolarmente precisi e naturali, e ripristinale quando la bozza le ha sostituite con equivalenti meno precisi.",
    "Controlla che emoji, simboli e altri elementi espressivi presenti nell'originale non siano stati eliminati senza motivo.",
    "Penalizza e correggi formule come 'l'opera', 'la narrazione', 'il nodo centrale', 'si tratta di', 'è importante' o 'lavoro cinematografico' quando sostituiscono parole più semplici dell'originale senza un vantaggio reale.",
    "Se l'originale contiene un invito, un imperativo o una frase personale efficace, non trasformarlo in una raccomandazione impersonale.",
    "Controlla che il testo non sia diventato troppo levigato, simmetrico o prevedibile.",
    "Se due frasi consecutive hanno struttura o ritmo troppo simili, rendile più naturali senza introdurre nuove informazioni.",
    "Verifica anche il problema opposto: se la bozza conserva troppe frasi quasi identiche all'originale, riformula le parti non protette cambiando realmente la costruzione sintattica, senza toccare le ancore semantiche.",
    "Per intensità media, il testo finale deve conservare la stessa architettura delle idee ma risultare chiaramente riscritto nella maggior parte dei passaggi: evita sequenze estese copiate quasi letteralmente quando possono essere espresse diversamente senza perdita di precisione.",
    "Esegui un passaggio finale dedicato alla punteggiatura: controlla incisi, subordinate, coordinazioni, domande, due punti e pause interne.",
    "Correggi virgole mancanti intorno agli incisi quando servono alla leggibilità; evita però la virgola tra soggetto e verbo o tra verbo e complemento diretto.",
    "Quando una frase è troppo lunga, valuta un punto fermo invece di accumulare virgole.",
    "Rimuovi ridondanze residue e formule generiche.",
    "Mantieni la modalità e il tono richiesti.",
    intensityRules(options.intensity),
    modeRules(options),
    getPresetRules(options.preset),
    getM5SStyleRules(),
    "Restituisci esclusivamente la versione finale pronta all'uso.",
  ].join(" ");
}

async function generateText(instructions: string, input: string, selectedModel: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY non configurata");
  }

  const maxAttempts = 4;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: instructions }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: input }],
            },
          ],
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

      if (!text) {
        throw new Error("Gemini non ha restituito testo.");
      }

      return text;
    }

    const errorText = await response.text();
    lastError = new Error(`Gemini API error ${response.status}: ${errorText}`);

    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === maxAttempts) {
      throw lastError;
    }

    const delayMs = 1000 * 2 ** (attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw lastError || new Error("Gemini API error sconosciuto");
}

export async function humanizeText(text: string, options: HumanizeOptions) {
  const selectedModel = options.model || defaultModel;
  const analysis = await generateText(buildAnalysisInstructions(options), text, selectedModel);

  const draft = await generateText(
    buildRewriteInstructions(options),
    [
      "TESTO ORIGINALE:",
      text,
      "",
      "PIANO EDITORIALE:",
      analysis,
    ].join("\n"),
    selectedModel
  );

  const finalPass = await generateText(
    buildReviewInstructions(options),
    [
      "ORIGINALE:",
      text,
      "",
      "BOZZA:",
      draft,
    ].join("\n"),
    selectedModel
  );

  return {
    text: finalPass.trim(),
    meta: {
      provider: "gemini",
      model: selectedModel,
      stages: ["analysis", "rewrite", "faithfulness-review"],
      mode: options.mode,
      intensity: options.intensity || "media",
      platform: options.mode === "social" ? options.platform || null : null,
      preset: options.preset || "balanced",
    },
  };
}
