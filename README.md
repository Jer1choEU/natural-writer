# Natural Writer

Natural Writer è una web app che trasforma testi rigidi, impersonali o generati con IA in testi più naturali, scorrevoli e adatti al contesto.

## Obiettivo

Il progetto è un editor di riscrittura stilistica. 

Principi:
- preservare significato, fatti, nomi e numeri;
- migliorare ritmo, lessico e naturalezza;
- evitare formule ripetitive e strutture eccessivamente uniformi;
- adattare il testo al contesto e al pubblico;
- trasformare direttamente un testo in un post social pronto all'uso.

## Modalità dell'interfaccia

- **Social** — riscrittura pensata per i contenuti social, diretta e leggibile.
- **Naturale** — riscrittura scorrevole, senza adattamento ai formati social.

L'interfaccia offre soltanto queste due modalità: non mostra intensità, preset o impostazioni avanzate. Il motore applica automaticamente uno stile coerente con la comunicazione M5S in entrambe le modalità, preservando opinioni e informazioni originali. Il controllo di coerenza politica non compare più nell'interfaccia (la relativa API interna rimane disponibile nel codice).

## Humanization Engine

Il motore usa una pipeline multi-pass:

```
testo originale
  ↓
analisi stilistica + ossatura semantica
  ↓
2 o 3 strategie secondo la lunghezza
  ↓
ranking, controllo e revisione
  ↓
controllo deterministico, riparazione mirata
  ↓
Quality Judge nella selezione
  ↓
output finale
```

Il controllo finale confronta originale e bozza per ridurre alterazioni di significato, aggiunte non supportate e slittamenti di tono o certezza.

## Training stilistico

Ogni scelta A/B contribuisce al profilo stilistico. Se Auto-Learning è abilitato nella pagina Memoria, anche le correzioni manuali alle varianti utilizzate diventano esempi di training.

Il training usa due livelli:
- **profilo aggregato**: con Turso collegato, tutti i confronti salvati contribuiscono ai segnali ricorrenti, come distanza dall'originale, concisione, ritmo delle frasi, semplicità lessicale e preferenze di punteggiatura;
- **memoria recente**: gli ultimi 3 confronti vengono mantenuti come esempi diretti per dettagli di voce che le metriche non catturano.

Il profilo è conservativo: una singola scelta ha peso basso e fedeltà semantica e naturalezza hanno sempre priorità.

Se configurato, lo storico viene salvato permanentemente in Turso e sincronizzato tra dispositivi che accedono allo stesso account. Il vecchio localStorage viene migrato automaticamente e mantenuto come copia di sicurezza. Senza collegamento a Turso rimane disponibile il vecchio training locale fino a 50 preferenze. Gli account individuali sono ancora da implementare (attualmente esiste un unico login).

## Stack

- Next.js
- TypeScript
- React
- Gemini Developer API
- provider e modello configurabili via variabili d'ambiente

## Configurazione

Copia `.env.example` in `.env.local` e imposta:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash-lite
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

La chiave viene letta solo lato server.

## Avvio locale

```bash
npm install
npm run dev
```

Poi apri `http://localhost:3000`.

## Stato

🟡 **Beta interna funzionale.** Riscrittura con due modalità, confronto A/B, training stilistico aggregato, benchmark e knowledge base M5S sono operativi. Per il deploy serve `GEMINI_API_KEY`; la persistenza tra dispositivi richiede il collegamento delle credenziali Turso sul deployment.


## Regole qualitative

Natural Writer non si limita a parafrasare. Il motore cerca di ridurre alcuni pattern stilistici che rendono un testo rigido o artificiale, tra cui:

- frasi tutte della stessa lunghezza;
- paragrafi troppo simmetrici;
- abuso di formule come `non solo... ma anche`;
- conclusioni automatiche e mini-riassunti a fine paragrafo;
- elenchi non necessari;
- abuso di parole enfatiche come `fondamentale`, `cruciale`, `essenziale`;
- nominalizzazioni e linguaggio astratto;
- eccesso di due punti e trattini;
- transizioni generiche;
- ripetizioni semantiche;
- hook, CTA e domande finali inseriti meccanicamente nei post social.

### Profondità interna di riscrittura

Il motore mantiene una profondità tecnica di default senza esporre alcun selettore di intensità all’utente. I vecchi parametri possono ancora essere usati dai benchmark interni.

### Controllo di fedeltà

L'ultimo passaggio confronta la bozza con l'originale per evitare:

- alterazioni di numeri o nomi;
- aggiunte non supportate;
- rafforzamento o attenuazione involontaria delle tesi;
- cambiamenti nei rapporti causali;
- perdita di incertezze o cautele presenti nel testo originale.


## Preset di stile

Il motore include profili stilistici riutilizzabili basati su caratteristiche astratte di scrittura, non sull'imitazione di una persona specifica:

- Naturale equilibrato
- Editoriale autorevole
- Social diretto
- LinkedIn personale
- Giornalistico asciutto
- Commento politico incisivo
- Storytelling personale
- Minimalista
- Divulgazione chiara
- Post civico / attivismo

Ogni preset modifica ritmo, densità, struttura, livello di formalità e tipo di apertura/chiusura, mantenendo i controlli di fedeltà sul contenuto.


## Benchmark preset

Il progetto include un benchmark interno per confrontare preset e intensità su testi campione.

Esecuzione:

```bash
npm run benchmark
```

Per limitare il numero di testi elaborati:

```bash
BENCHMARK_LIMIT=2 npm run benchmark
```

Il benchmark confronta:
- variazione di lunghezza;
- lunghezza media delle frasi;
- ripetizione delle aperture;
- presenza di formule generiche;
- abuso di enfasi;
- qualità euristica complessiva.

I risultati vengono salvati in `benchmark-results/latest.json` e `benchmark-results/summary.json`.

Il punteggio euristico serve soltanto come segnale tecnico: non sostituisce una valutazione umana di naturalezza, fedeltà e qualità editoriale.


### Benchmark da GitHub Actions

È disponibile il workflow manuale **Benchmark Natural Writer**.

Prima dell'esecuzione aggiungi nella repository il secret:

```
GEMINI_API_KEY
```

Poi vai in **Actions → Benchmark Natural Writer → Run workflow**.

Puoi scegliere:
- `benchmark_limit`: numero di testi campione;
- `model`: modello Gemini da usare.

Il workflow esegue typecheck, regression check del profilo stilistico, controlli M5S, build, benchmark e carica i risultati come artifact per 14 giorni.


## Provider predefinito

Natural Writer usa **Gemini 3.5 Flash-Lite** come modello predefinito, così il progetto può partire usando il free tier della Gemini Developer API.

Il provider è isolato dal resto del motore, quindi in futuro sarà possibile aggiungere OpenAI, OpenRouter, Mistral o altri backend senza riscrivere l'interfaccia.


## Quality Judge

Il benchmark combina due livelli di valutazione:

- **Heuristic score**: segnali tecnici deterministici su lunghezza, ripetizioni, formule generiche e struttura.
- **Quality Judge**: valutazione editoriale separata su fedeltà, naturalezza, ritmo, specificità e assenza di tic artificiali.

Il judge usa `GEMINI_JUDGE_MODEL` (default: `gemini-3.5-flash-lite`) e viene impiegato anche per scegliere le candidate nella riscrittura ordinaria. Non blocca la generazione se indisponibile.


## Qualità v2 (ottobre 2026)

- Riscrittura selettiva: conserva le frasi già naturali e interviene sulle parti rigide.
- Pipeline adattiva: 2 candidate per testi brevi e medi, 3 per testi lunghi, con fasi di analisi opzionali.
- Verifica deterministica finale su numeri, citazioni, sigle e termini protetti; riparazione mirata e fallback conservativo.
- Quality Judge utilizzato nel ranking delle alternative, non soltanto nel benchmark.
- Scelta di alternative A/B diverse quando la qualità lo permette.
- Editor delle alternative modificabile e riformulazione del solo passaggio selezionato.
- Il training A/B memorizza anche la versione modificata manualmente prima della scelta.
- Interfaccia semplificata con due sole modalità: Social e Naturale.
- Stile M5S automatico e attivo di default in entrambe le modalità.
- Metriche italiane: Gulpease, diversità lessicale, variazione dei periodi, densità di punteggiatura e formule ricorrenti.
- Nuovo workflow Quality checks. Verifica gratuita: npm run quality-check, npm run typecheck, npm run build.

### Limiti e costi

Il controllo semantico deterministico non può garantire da solo l'equivalenza di tutte le affermazioni. I punteggi automatici non sono una misura certa della paternità umana. La pipeline usa più chiamate a Gemini (incluso il Judge, quando disponibile), quindi testo, intensità e numero di candidate incidono sulla quota. Manca ancora un grande benchmark italiano con valutazioni umane indipendenti. Il training è persistente nel database quando Turso è collegato, con un fallback locale conservativo se la configurazione manca.

## Prossimo sviluppo in coda

Training persistente e Auto-Learning controllato: vedere https://github.com/Jer1choEU/natural-writer/issues/3. Non ancora implementato: nessun database di training o processo automatico viene attivato da questo aggiornamento.


## Memoria permanente e Auto-Learning (ottobre 2026)

- Endpoint di memoria autenticati, storage libSQL/Turso con storico deduplicato, profilo cumulativo per modalità e versionamento.
- Migrazione automatica del precedente training browser dopo conferma del database.
- Apprendimento dalle correzioni usate, con consenso esplicito; nessun training automatico dai testi generati e non utilizzati.
- Importazione di esempi autentici, esportazione e ripristino di backup JSON, rollback del profilo e cancellazione dei dati.
- Cron giornaliero opzionale per backup compressi su Vercel Blob privato separato da Turso.
- Due modalità Social e Naturale mantenute; stile M5S automatico.

**Per abilitare il cloud:** collegare Turso al progetto Vercel, poi aprire la pagina /learning. Per attivare il backup automatico configurare anche Blob privato e CRON_SECRET. Nessuna credenziale viene fornita o creata dalla repository.

Procedura completa: [docs/persistent-learning.md](docs/persistent-learning.md).
