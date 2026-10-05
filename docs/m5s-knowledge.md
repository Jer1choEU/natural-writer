# Knowledge base politica M5S

Natural Writer separa due livelli distinti:

- `lib/m5s-style.ts`: come scrivere in un registro coerente con la comunicazione M5S;
- `lib/m5s-knowledge/`: quali principi e posizioni ufficiali risultano dalle fonti M5S.

## Gerarchia

1. **Fondativa** — Statuto e Carta dei Principi e dei Valori.
2. **Etica** — Codice Etico vigente.
3. **Posizioni deliberate** — proposte politiche approvate dagli iscritti, oggi principalmente NOVA 2026.
4. **Organizzativa** — regolamenti che disciplinano la vita interna e territoriale.
5. Comunicazioni e dichiarazioni di singoli esponenti non diventano automaticamente conoscenza normativa o programmatica.

La gerarchia non significa che un regolamento sia "meno valido" dello Statuto nel proprio ambito: serve al motore per non confondere una norma organizzativa, un principio valoriale e una proposta politica.

## Regola di non contaminazione

La knowledge base **non autorizza il writer ad aggiungere contenuti politici**.

Durante una normale riscrittura:
- preserva sempre ciò che dice l'originale;
- usa la knowledge base per comprendere meglio termini e posizioni;
- non trasforma una critica al M5S in una posizione M5S;
- non inserisce automaticamente slogan, proposte o argomenti mancanti;
- non presenta una dichiarazione di un esponente come principio ufficiale.

## Fonti correnti

- Statuto M5S e Carta dei Principi e dei Valori, in vigore dal 23 giugno 2025.
- Codice Etico, in vigore dal 23 giugno 2025.
- Regolamento Gruppi Territoriali, aggiornato al 14 marzo 2026.
- Consultazioni NOVA 2026 concluse il 20 settembre 2026.
- NOVA 2024 conservata come contesto storico delle priorità e della Costituente.

Le URL ufficiali e le date sono definite in `lib/m5s-knowledge/sources.ts`.

## Retrieval

`getM5SKnowledgeContext(text)`:
- normalizza il testo;
- individua principi e posizioni pertinenti tramite parole chiave;
- seleziona al massimo 5 principi e 8 posizioni;
- restituisce un contesto compatto con fonte e livello di autorità.

Questo evita di inviare al modello l'intero corpus a ogni riscrittura.
