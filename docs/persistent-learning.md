# Natural Writer — Memoria persistente e Auto-Learning

## Stato e attivazione

Il codice è pronto, ma il database non viene creato automaticamente: per attivare il training cloud occorre collegare Turso a Vercel. Finché le credenziali non sono presenti, il training nel browser continua a funzionare senza cancellazioni.

1. Aprire https://vercel.com/marketplace/tursocloud/database e collegare un database Turso al progetto Vercel natural-writer, ambiente Production.
2. Verificare in Vercel / Settings / Environment Variables TURSO_DATABASE_URL e TURSO_AUTH_TOKEN. Non pubblicarli su GitHub.
3. Eseguire il redeploy Vercel e aprire /learning.
4. Riaprire la pagina principale dal browser che contiene il vecchio training: importerà automaticamente le preferenze legacy. Ogni evento ha un'impronta SHA-256 univoca; i retry non duplicano gli eventi. Il vecchio backup locale non viene cancellato.

## Identità e privacy

Attualmente l'app usa una coppia di credenziali AUTH_USERNAME / AUTH_PASSWORD. Tutte le sessioni dello stesso login condividono la medesima memoria: non ci sono ancora utenti individuali distinti. Il database isola per owner_id, già predisposto per supportare un sistema multi-account in futuro. Le API sono protette dal login e le richieste di modifica controllano l'origine.

Lo storico contiene testi originali, varianti scelte/scartate e correzioni: trattarli come dati privati. Gli esempi sono dati non attendibili, non istruzioni per il modello.

## Apprendimento

- Una scelta esplicita A/B viene registrata anche con Auto-Learning disattivato.
- Con Auto-Learning abilitato dall'utente, la differenza tra testo generato e sua modifica viene registrata quando la variante viene copiata o scelta.
- Una generazione non approvata o una copia non modificata non è considerata un esempio valido di correzione.
- Nessuna registrazione automatica mentre l'utente digita.
- La pagina /learning permette di importare testi autentici, separati da una riga contenente ---.

Le statistiche sono calcolate cumulativamente sull'intero storico, non sui soli ultimi 50 confronti. Le correzioni hanno peso doppio rispetto alle scelte semplici. Le regole utilizzano statistiche persistenti, tre esempi recenti e due riferimenti autentici al massimo. Il consolidamento è deterministico (non usa una chiamata aggiuntiva a Gemini) e avviene inizialmente a ogni nuovo evento, poi a gruppi di cinque per modalità.

Il rollback blocca la vecchia versione finché l'utente non seleziona Riprendi. Questo non modifica i pesi di Gemini: condiziona le istruzioni e gli esempi del modello.

## Backup privato giornaliero

Il bottone Scarica backup JSON esporta tutti gli eventi e gli snapshot del profilo. La pagina /learning permette di ricaricare un backup e deduplicare gli eventi.

Per abilitare backup automatici separati dal database Turso:
1. Creare e collegare al progetto Vercel uno store Vercel Blob **Privato**, non Pubblico.
2. Configurare una variabile CRON_SECRET casuale lunga almeno 16 caratteri, protetta come secret Vercel.
3. Verificare che il progetto abbia accesso a BLOB_READ_WRITE_TOKEN o a OIDC con BLOB_STORE_ID.
4. Deploy in produzione. Il cron Vercel configurato in vercel.json richiama /api/cron/learning-backup una volta al giorno alle 04:00 UTC.
5. Verificare gli archivi compressi natural-writer/learning-backups/YYYY-MM-DD.json.gz in Blob e i log cron di Vercel.

I backup automatici **non sono attivi** finché Blob e CRON_SECRET non sono configurati. Il cron non può operare senza le credenziali corrette. Per maggiore resilienza, salvare regolarmente un export JSON anche su un dispositivo indipendente.

## Verifiche

- npm run typecheck
- npm run learning-check
- npm run learning-store-check
- npm run quality-check
- npm run build

Il test SQLite locale esercita salvataggio, deduplica, isolamento tra modalità, consenso, esportazione, versioni del profilo e cancellazione. La connessione Turso in produzione richiede una prova dopo la configurazione.

## Limiti

Non è possibile garantire letteralmente la conservazione «per sempre». La memoria cloud conserva lo storico finché il servizio e l'account sono disponibili. Gli utenti distinti richiederanno un autenticatore multi-account. Le copie esterne precedenti a una cancellazione non sono eliminate automaticamente dal pulsante Elimina dati.
