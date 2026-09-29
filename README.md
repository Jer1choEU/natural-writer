# Natural Writer

Natural Writer è una web app che trasforma testi rigidi, impersonali o generati con IA in testi più naturali, scorrevoli e adatti al contesto.

## Obiettivo

Il progetto non nasce per "bypassare" sistemi di rilevazione, ma come editor di riscrittura stilistica.

Principi:
- preservare significato e fatti;
- migliorare ritmo, lessico e naturalezza;
- evitare formule ripetitive e strutture eccessivamente uniformi;
- adattare il testo al contesto e al pubblico;
- consentire la trasformazione diretta in un post social pronto alla pubblicazione.

## MVP

### Modalità
- **Naturale** — riscrittura equilibrata e scorrevole.
- **Professionale** — più chiara, ordinata e adatta a contesti di lavoro.
- **Social post** — trasforma il contenuto in un post per social network.

### Social post
Piattaforme iniziali:
- Instagram
- Facebook
- LinkedIn
- X
- Threads

Parametri:
- tono;
- lunghezza;
- intensità della riscrittura;
- emoji sì/no;
- call to action sì/no;
- domanda finale sì/no.

## Architettura prevista

```
input
  ↓
analisi stilistica
  ↓
piano di riscrittura
  ↓
riscrittura
  ↓
controllo di fedeltà
  ↓
rifinitura
  ↓
output
```

L'interfaccia e il motore di trasformazione devono rimanere separati, così da poter modificare modelli, prompt e regole senza riscrivere la UI.

## Stack iniziale

- Next.js
- TypeScript
- React
- API server-side
- provider LLM configurabile
- persistenza opzionale in una fase successiva

## Stato

🚧 MVP in costruzione.
