export type StylePreset =
  | "balanced"
  | "editorial"
  | "social-direct"
  | "linkedin-personal"
  | "journalistic"
  | "political-comment"
  | "storytelling"
  | "minimal"
  | "explainer"
  | "civic";

export const STYLE_PRESETS: Record<
  StylePreset,
  { label: string; description: string; rules: string[] }
> = {
  balanced: {
    label: "Naturale equilibrato",
    description: "Voce pulita, naturale e versatile.",
    rules: [
      "Mantieni un ritmo vario ma sobrio.",
      "Evita enfasi eccessiva.",
      "Preferisci chiarezza e naturalezza a effetti stilistici.",
    ],
  },
  editorial: {
    label: "Editoriale autorevole",
    description: "Argomentativo, netto e leggibile.",
    rules: [
      "Apri con una tesi o un punto chiaro.",
      "Usa periodi medi, con qualche frase breve per dare ritmo.",
      "Mantieni autorevolezza senza burocratese.",
      "Riduci formule enfatiche e slogan.",
    ],
  },
  "social-direct": {
    label: "Social diretto",
    description: "Rapido, leggibile e adatto allo scroll.",
    rules: [
      "Apri con una frase breve e concreta.",
      "Usa paragrafi corti.",
      "Taglia premesse e formule di contorno.",
      "Mantieni energia senza engagement bait.",
    ],
  },
  "linkedin-personal": {
    label: "LinkedIn personale",
    description: "Professionale ma personale, senza corporate-speak.",
    rules: [
      "Usa una voce personale e concreta.",
      "Evita motivational-speak e formule da personal branding.",
      "Mantieni esempi e osservazioni specifiche.",
      "Chiudi in modo naturale, senza morale obbligatoria.",
    ],
  },
  journalistic: {
    label: "Giornalistico asciutto",
    description: "Informativo, preciso e poco ornamentale.",
    rules: [
      "Porta subito in primo piano fatti e informazioni.",
      "Usa frasi chiare e relativamente brevi.",
      "Evita giudizi impliciti non presenti nell'originale.",
      "Riduci aggettivi e avverbi non necessari.",
    ],
  },
  "political-comment": {
    label: "Commento politico incisivo",
    description: "Tesi netta, ritmo forte, senza slogan prefabbricati.",
    rules: [
      "Rendi chiara la tesi dell'autore senza estremizzarla.",
      "Usa contrasti solo quando sono già impliciti o espliciti nel testo.",
      "Preferisci frasi nette a formule astratte.",
      "Evita propaganda, slogan automatici e caricature dell'avversario.",
    ],
  },
  storytelling: {
    label: "Storytelling personale",
    description: "Più narrativo, con ritmo e progressione.",
    rules: [
      "Mantieni una progressione narrativa chiara.",
      "Alterna frasi brevi e medie.",
      "Dai spazio ai dettagli concreti presenti nell'originale.",
      "Evita metafore inventate o scene non supportate.",
    ],
  },
  minimal: {
    label: "Minimalista",
    description: "Poche parole, alta densità informativa.",
    rules: [
      "Taglia il superfluo senza perdere contenuto.",
      "Preferisci frasi brevi.",
      "Evita introduzioni e conclusioni decorative.",
      "Riduci ripetizioni e qualificatori.",
    ],
  },
  explainer: {
    label: "Divulgazione chiara",
    description: "Semplice da seguire, ma non infantile.",
    rules: [
      "Spiega passaggi complessi con ordine.",
      "Usa parole comuni quando bastano.",
      "Mantieni termini tecnici necessari, chiarendoli nel contesto.",
      "Evita tono scolastico o paternalistico.",
    ],
  },
  civic: {
    label: "Post civico / attivismo",
    description: "Concreto, territoriale e orientato al problema.",
    rules: [
      "Metti al centro fatto, problema e conseguenza concreta.",
      "Usa un tono diretto e comprensibile.",
      "Evita retorica astratta e slogan generici.",
      "Se c'è una richiesta d'azione, rendila concreta e proporzionata.",
    ],
  },
};

export function getPresetRules(preset: StylePreset | undefined) {
  return STYLE_PRESETS[preset || "balanced"].rules.join(" ");
}
