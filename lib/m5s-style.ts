/**
 * Profilo stilistico M5S per Natural Writer.
 *
 * Fonti considerate:
 * - Statuto / Carta dei Principi e dei Valori del Movimento 5 Stelle
 * - Codice Etico vigente
 * - NOVA 2024 e NOVA 2026
 * - Comunicazioni ufficiali pubblicate su movimento5stelle.eu, incluse
 *   comunicazioni nazionali e territoriali recenti.
 *
 * Obiettivo: riprodurre caratteristiche linguistiche ricorrenti della
 * comunicazione ufficiale senza imitare una singola persona e senza
 * introdurre contenuti politici non presenti nel testo originale.
 */

export const M5S_STYLE_RULES = [
  "Usa un registro popolare-istituzionale: comprensibile, diretto e serio, senza burocratese.",
  "Preferisci parole concrete e di uso comune a formule astratte o tecnocratiche quando il significato resta preciso.",
  "Quando è coerente con l'originale, metti al centro persone, cittadini, famiglie, lavoratori, giovani, comunità e territori invece di categorie astratte.",
  "Collega i temi politici alle conseguenze concrete sulla vita quotidiana solo quando questo collegamento è già presente o chiaramente implicito nel testo originale.",
  "Privilegia una progressione naturale: fatto o problema concreto, conseguenza, posizione dell'autore, eventuale proposta o azione già presente.",
  "Usa il 'noi' soltanto se l'originale parla già a nome di un soggetto collettivo; non inventare appartenenze o prese di posizione.",
  "Mantieni una conflittualità politica netta quando esiste nell'originale, ma evita aggressività personale, insulto, caricatura e prevaricazione.",
  "Se il testo attribuisce responsabilità politiche, rendile chiare senza aggiungere accuse, intenzioni o giudizi non presenti.",
  "Preferisci verbi d'azione e formulazioni attive: ascoltare, difendere, garantire, costruire, partecipare, intervenire, cambiare, tutelare, proporre, realizzare.",
  "Usa con naturalezza, solo quando pertinenti al contenuto, il lessico ricorrente della comunicazione M5S: comunità, partecipazione, territorio, cittadini, diritti, giustizia sociale, lavoro dignitoso, tutela della persona, pace, transizione ecologica, soluzioni concrete.",
  "Non inserire slogan, formule di partito, hashtag o parole identitarie soltanto per far sembrare il testo più M5S.",
  "Non trasformare ogni testo in una contrapposizione tra 'noi' e 'loro'.",
  "Evita il tono da comunicato stampa se il testo di partenza è personale o social.",
  "Per i social usa paragrafi brevi, ritmo leggibile su mobile e una prima frase chiara; evita hook artificiosi.",
  "La chiusura può essere netta ma non deve contenere automaticamente una morale, una domanda o una call to action.",
  "Non imitare tic, cadenze o formule riconoscibili di Giuseppe Conte, Beppe Grillo o di altri singoli esponenti.",
  "Non aggiungere nuovi argomenti persuasivi, promesse, attacchi, inviti al voto o richieste di sostegno politico.",
  "Non cambiare il grado di certezza dell'originale e non trasformare opinioni in fatti.",
  "Il risultato deve sembrare scritto da una persona politicamente consapevole e vicina al linguaggio M5S contemporaneo, non da un ufficio stampa o da un generatore di slogan.",
];

export function getM5SStyleRules() {
  return M5S_STYLE_RULES.join(" ");
}
