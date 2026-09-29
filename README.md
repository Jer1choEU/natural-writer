# Natural Writer

Natural Writer è una web app che trasforma testi rigidi, impersonali o generati con IA in testi più naturali, scorrevoli e adatti al contesto.

## Obiettivo

Il progetto è un editor di riscrittura stilistica. Non ha come obiettivo l'elusione di sistemi di rilevazione.

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
- OpenAI Responses API
- provider e modello configurabili via variabili d'ambiente

## Configurazione

Copia `.env.example` in `.env.local` e imposta:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-6-astra
```

La chiave viene letta solo lato server.

## Avvio locale

```bash
npm install
npm run dev
```

Poi apri `http://localhost:3000`.

## Stato

🚧 MVP funzionante lato codice. Serve configurare `OPENAI_API_KEY` nell'ambiente di deploy per effettuare trasformazioni reali.


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
