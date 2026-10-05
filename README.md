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

## MVP

### Modalità
- **Naturale** — riscrittura equilibrata e scorrevole.
- **Professionale** — più chiara, ordinata e adatta a contesti di lavoro.
- **Social post** — adatta il contenuto a un social network.

### Social post
Piattaforme:
- Instagram
- Facebook
- LinkedIn
- X
- Threads

Parametri:
- tono;
- intensità della riscrittura;
- emoji sì/no;
- call to action sì/no;
- domanda finale sì/no.

## Humanization Engine

Il motore usa tre passaggi:

```
testo originale
  ↓
analisi stilistica
  ↓
riscrittura
  ↓
controllo di fedeltà + rifinitura
  ↓
output finale
```

L'ultimo passaggio confronta originale e bozza per ridurre alterazioni di significato e aggiunte non supportate.

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
```

La chiave viene letta solo lato server.

## Avvio locale

```bash
npm install
npm run dev
```

Poi apri `http://localhost:3000`.

## Stato

🚧 MVP funzionante lato codice. Serve configurare `GEMINI_API_KEY` nell'ambiente di deploy per effettuare trasformazioni reali.


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

### Intensità

- **Leggera**: corregge soprattutto rigidità e ripetizioni, mantenendo struttura e lessico il più possibile.
- **Media**: modifica ritmo e sintassi con libertà moderata.
- **Profonda**: può ristrutturare periodi e paragrafi, mantenendo invariati significato e fatti.

### Controllo di fedeltà

L'ultimo passaggio confronta la bozza con l'originale per evitare:

- alterazioni di numeri o nomi;
- aggiunte non supportate;
- rafforzamento o attenuazione involontaria delle tesi;
- cambiamenti nei rapporti causali;
- perdita di incertezze o cautele presenti nel testo originale.


## Preset di stile

L'MVP include profili stilistici riutilizzabili basati su caratteristiche astratte di scrittura, non sull'imitazione di una persona specifica:

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

Il workflow esegue typecheck, benchmark e carica i risultati come artifact per 14 giorni.


## Provider predefinito

Natural Writer usa **Gemini 3.5 Flash-Lite** come modello predefinito per l'MVP, così il progetto può partire usando il free tier della Gemini Developer API.

Il provider è isolato dal resto del motore, quindi in futuro sarà possibile aggiungere OpenAI, OpenRouter, Mistral o altri backend senza riscrivere l'interfaccia.


## Quality Judge

Il benchmark combina due livelli di valutazione:

- **Heuristic score**: segnali tecnici deterministici su lunghezza, ripetizioni, formule generiche e struttura.
- **Quality Judge**: valutazione editoriale separata su fedeltà, naturalezza, ritmo, specificità e assenza di tic artificiali.

Il judge usa `GEMINI_JUDGE_MODEL` (default: `gemini-3.5-flash-lite`) e non blocca l'intera run se temporaneamente non disponibile.
