# Natural Writer — architettura editoriale (fase 1)

## Stato e compatibilità

Questa iterazione estende l'attuale `humanizeText` senza cambiare le API HTTP o i formati di Auto-Learning. Resta la scelta Social / Naturale, compreso il profilo salvato. **Non ci sono migrazioni, reset, scritture a Turso, cambi alle credenziali, all'auth o a Vercel Blob** in questa PR.

## Pipeline

1. **Registro delle affermazioni** (`lib/claim-ledger.ts`): Gemini analizza il testo in segmenti (massimo 3.600 caratteri per chiamata), estrae i record `Claim` ancorati a un estratto letterale della fonte. Sono registrati soggetto, azione, oggetto, quantità, condizioni, negazioni, intensità, certezza e dettagli obbligatori. Il JSON è validato prima di procedere.
2. **Piano editoriale** (`lib/editorial-plan.ts`): per i testi lunghi produce decisioni tipizzate `keep`, `lighten`, `rebuild`, una per paragrafo, più una valutazione delle aperture e transizioni. Se la risposta JSON è invalida, riutilizza l'analisi testuale precedente.
3. **Generazione**: restano le strategie esistenti, i preset, le regole Social/Naturale e i riferimenti stilistici. I testi di training non sono fonti fattuali.
4. **Filtro deterministico + giudice editoriale**: mantengono la loro funzione, ma un giudizio assente o con guadagno editoriale insufficiente non basta più a promuovere la bozza.
5. **Verifica indipendente per affermazione**: per ciascun ID richiede uno stato `preserved`, `partial`, `omitted`, `altered` o `contradicted`; controlla aggiunte non supportate e richiede un risultato per ogni ID.
6. **Correzione localizzata**: esegue al massimo un intervento soltanto quando il verificatore restituisce un frammento della bozza esatto e univoco; poi riesegue verifica e controlli. Se non è possibile intervenire in sicurezza, restituisce l'originale.
7. **A/B**: due alternative soltanto se distinte e idonee. Nessuna bozza viene presentata come semanticamente validata se l'estrazione o la verifica falliscono.

## Limiti noti

- Un verificatore LLM può sbagliare e il suo giudizio non costituisce una prova matematica di equivalenza. Anche l'estrazione iniziale potrebbe omettere affermazioni: è indispensabile misurare il tasso di omissioni in un benchmark **annotato manualmente**.
- La correzione locale non può ancora recuperare automaticamente ogni tipo di omissione, soprattutto quando non c'è un estratto corrispondente. In questi casi ritorna l'originale.
- Per testi di 20.000 caratteri, numero di chiamate e latenza possono crescere; l'attuale limite di 150 affermazioni e due tentativi per chiamata JSON evita elaborazioni illimitate ma non fornisce una garanzia di tempo costante.
- Le correzioni manuali nell'editor continuano a passare per il flusso di apprendimento esistente; non è stata introdotta alcuna scrittura supplementare.
- I test offline verificano tipi, parser, regole e fallback. **Non** provano l'accuratezza di Gemini o un miglioramento reale di naturalezza.

## Verifiche riproducibili

```bash
npm install
npm run typecheck
npm run claim-ledger-check
npm run rewrite-quality-check
npm run learning-check
npm run learning-store-check
npm run build
```

Il corpus di `benchmarks/samples.ts` comprende ora 33 testi. I modelli supportati nel confronto predefinito sono `gemini-3.5-flash-lite`, `gemini-3.6-flash` e `gemini-3.8-flash`. Un confronto reale richiede la chiave in ambiente CI autorizzato e l'esecuzione controllata di `npm run benchmark`; registrare campioni, commit, modello, token, latenza, costo, esiti per affermazione e preferenze cieche. Non inviare segreti, testo originale e profili a log pubblici.

## Rilascio

Eseguire CI, ispezionare il deployment preview collegato alla PR e confrontare almeno testi brevi e lunghi con la versione precedente. Integrare in produzione solo dopo una verifica runtime su credenziali autorizzate; poi controllare l'alias di produzione e il commit effettivo. È opportuno monitorare quante trasformazioni ricadono nel fallback, prima di dichiarare il motore migliorato.

## Roadmap

- Dataset annotato con esiti attesi per ogni singola affermazione, test live ciechi e confronto old/new.
- Valutazione dei modelli per ruolo (estrattore, autore, revisore, giudice), senza aumenti di costo non giustificati.
- Miglioramento del calcolo dei segnali di stile, mantenendo separate le modalità e lo schema dei dati.
- Riparazioni a livello di paragrafo e metriche di costo/tempo aggregate, senza memorizzare il contenuto testuale.
