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
