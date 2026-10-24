export type BenchmarkSample = {
  id: string;
  category: "informative" | "social" | "professional" | "opinion" | "civic";
  text: string;
};

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: "informative-1",
    category: "informative",
    text: "La riunione si è svolta martedì mattina e ha coinvolto i responsabili dei tre gruppi di lavoro. Durante l'incontro sono stati discussi i risultati dell'ultimo trimestre, le principali criticità operative e le attività da completare entro la fine del mese. È stato inoltre deciso di aggiornare il calendario delle consegne.",
  },
  {
    id: "informative-2",
    category: "informative",
    text: "Il nuovo servizio sarà attivo dal 15 ottobre. Gli utenti potranno accedere tramite il portale già esistente senza creare un nuovo account. Nella prima fase saranno disponibili soltanto le funzioni principali, mentre gli strumenti avanzati verranno aggiunti successivamente.",
  },
  {
    id: "social-1",
    category: "social",
    text: "Abbiamo concluso una giornata di incontri con residenti e commercianti del quartiere. Sono emersi diversi problemi legati alla pulizia delle strade, all'illuminazione e alla sicurezza degli attraversamenti pedonali. Nei prossimi giorni raccoglieremo tutte le segnalazioni ricevute e le organizzeremo per priorità.",
  },
  {
    id: "social-2",
    category: "social",
    text: "Questo progetto nasce con un obiettivo semplice: rendere più facile trasformare testi rigidi in contenuti più naturali. Vogliamo costruire uno strumento utile per chi scrive post, comunicazioni, articoli brevi e contenuti professionali.",
  },
  {
    id: "social-3-concrete-language",
    category: "social",
    text: "🎬 NAZA è in sala in questi giorni.\n\nIl documentario mostra la guerra a Gaza dall'interno, attraverso i racconti di soldati e ufficiali dell'intelligence israeliana. Mette a fuoco la disumanizzazione dei civili e quel linguaggio che riduce le persone a meri “danni collaterali”.\n\nSi parla di ordini, tecnologia, sorveglianza e responsabilità dei singoli. Ma il punto chiave è un altro: cosa succede quando, dietro sigle e numeri, smettiamo di vedere gli esseri umani?\n\nÈ un film duro, necessario, che resta addosso. Andiamo a vederlo e parliamone, perché, di fronte a certe testimonianze, sapere vuol dire anche scegliere di non voltarsi dall'altra parte.",
  },
  {
    id: "professional-1",
    category: "professional",
    text: "A seguito dell'analisi effettuata, si ritiene opportuno procedere con una revisione del processo attualmente in uso, al fine di ridurre i tempi di gestione e migliorare la chiarezza delle responsabilità tra i diversi soggetti coinvolti.",
  },
  {
    id: "professional-2",
    category: "professional",
    text: "Il team ha completato la prima fase del progetto nei tempi previsti. Rimangono aperte alcune attività relative ai test e alla documentazione tecnica, che dovranno essere completate prima del rilascio.",
  },
  {
    id: "opinion-1",
    category: "opinion",
    text: "Il problema non è soltanto la qualità del servizio, ma il fatto che da mesi manchi una risposta chiara. Le persone continuano a segnalare gli stessi problemi e ricevono risposte generiche. Serve un cambio di metodo, non l'ennesimo annuncio.",
  },
  {
    id: "opinion-2",
    category: "opinion",
    text: "Quando un dibattito pubblico si riduce a slogan, diventa difficile capire quali siano davvero le differenze tra le proposte. Sarebbe più utile discutere di effetti concreti, costi e priorità.",
  },
  {
    id: "civic-1",
    category: "civic",
    text: "In via Verdi diversi residenti segnalano da settimane un attraversamento pedonale poco visibile e una scarsa illuminazione nelle ore serali. La situazione crea difficoltà soprattutto per anziani e famiglie con bambini.",
  },
  {
    id: "civic-2",
    category: "civic",
    text: "Il parco è molto frequentato ma alcune aree risultano poco curate. Mancano cestini in diversi punti e alcune panchine sono danneggiate. La richiesta dei residenti è semplice: manutenzione regolare e interventi rapidi sui problemi già segnalati.",
  },
  { id: "political-1", category: "opinion", text: "Il programma chiede di limitare il consumo di suolo e di destinare maggiori risorse alla riqualificazione degli edifici esistenti. Nessuna delle due proposte equivale a bloccare ogni nuovo intervento." },
  { id: "political-2", category: "informative", text: "Il gruppo considera la sanità una delle principali priorità e propone un incremento dei finanziamenti pubblici per ridurre le liste d'attesa." },
  { id: "political-3", category: "informative", text: "Il documento propone più borse di studio per gli studenti fuori sede, ma non indica quanti beneficiari aggiuntivi sarebbero coperti." },
  { id: "political-4", category: "opinion", text: "La proposta riguarda il riconoscimento del matrimonio egualitario e un ampliamento delle tutele, non un giudizio sulle persone che la pensano diversamente." },
  { id: "political-5", category: "informative", text: "Sul piano fiscale si propone una maggiore contribuzione da parte delle grandi ricchezze, mantenendo il principio di progressività." },
  { id: "political-6", category: "opinion", text: "In politica estera vogliamo maggiore autonomia diplomatica e privilegiamo il dialogo rispetto all'aumento delle spese militari. Questo orientamento non equivale a escludere ogni investimento nella difesa." },
  { id: "social-4", category: "social", text: "Sabato siamo tornati in piazza per raccogliere le segnalazioni. In molti ci hanno parlato dei marciapiedi dissestati, ma anche della necessità di avere più alberi nelle strade. Non abbiamo promesso soluzioni immediate: abbiamo preso l'impegno di verificare le competenze degli uffici." },
  { id: "social-5", category: "social", text: "Per ora l'incontro è previsto per venerdì, ma la data sarà confermata solo dopo aver ottenuto la disponibilità della sala. Vi aggiorneremo appena possibile." },
  { id: "social-6", category: "social", text: "Non servono grandi parole per raccontare questa giornata. Abbiamo ascoltato persone che ogni mattina aspettano un autobus che spesso non arriva in orario." },
  { id: "professional-3", category: "professional", text: "Nell'ambito delle attività di monitoraggio attualmente in corso, si rappresenta la necessità di procedere, con la massima sollecitudine possibile, a una ricognizione puntuale delle segnalazioni già pervenute." },
  { id: "professional-4", category: "professional", text: "Il responsabile del progetto può autorizzare la spesa soltanto dopo aver ricevuto il preventivo definitivo. Gli altri membri del gruppo forniscono un parere non vincolante." },
  { id: "professional-5", category: "professional", text: "La consegna è prevista entro il 30 novembre. Se il cliente approverà la seconda fase, le funzionalità aggiuntive saranno incluse in un aggiornamento separato." },
  { id: "informative-3", category: "informative", text: "La nuova applicazione sarà disponibile su Android e iOS. L'accesso richiederà le stesse credenziali del sito esistente; nella prima versione non sarà introdotto un sistema di registrazione separato." },
  { id: "informative-4", category: "informative", text: "Sono state registrate 125 richieste, di cui 80 complete. Le altre 45 richiedono ulteriori verifiche; non possono quindi essere considerate pratiche respinte." },
  { id: "informative-5", category: "informative", text: "Secondo l'indagine, quasi un terzo degli intervistati utilizza il servizio ogni settimana. Il dato descrive il campione, non necessariamente l'intera popolazione." },
  { id: "opinion-3", category: "opinion", text: "Penso che una riforma possa essere utile anche quando non risolve tutti i problemi. È importante però evitare di chiamarla una svolta definitiva prima di averne valutato gli effetti." },
  { id: "opinion-4", category: "opinion", text: "Preferisco ascoltare le obiezioni prima di prendere posizione. Non significa che non abbia un'opinione, ma che non voglio arrivare a una decisione senza conoscere le conseguenze." },
  { id: "civic-3", category: "civic", text: "I residenti segnalano che l'illuminazione del sottopasso è insufficiente nelle ore serali. La richiesta riguarda un sopralluogo tecnico e, se necessario, la sostituzione degli apparecchi guasti." },
  { id: "civic-4", category: "civic", text: "Il municipio ha comunicato che i lavori potrebbero iniziare a dicembre, compatibilmente con le condizioni meteorologiche. Non è stata ancora annunciata una data certa." },
  { id: "well-written-1", category: "opinion", text: "Ci sono questioni che non si risolvono con uno slogan. Bisogna ascoltare chi vive un problema ogni giorno e poi assumersi la responsabilità di scegliere." },
  { id: "artificial-1", category: "social", text: "Nel contesto attuale, caratterizzato da una crescente complessità delle dinamiche sociali, risulta di fondamentale importanza mettere in campo iniziative capaci di promuovere processi virtuosi di partecipazione." },
  { id: "long-political-1", category: "informative", text: "Il programma affronta anzitutto il lavoro e la qualità dei servizi pubblici. Per i lavoratori dipendenti propone un salario minimo legale e maggiori tutele contro la precarietà. Per la sanità chiede più fondi, l'assunzione di personale e interventi per ridurre, non necessariamente azzerare, le liste d'attesa.\n\nSul fronte dell'istruzione propone più borse di studio, sostegno agli studenti fuori sede e investimenti nell'edilizia scolastica. Il documento richiama inoltre il contrasto alle disuguaglianze territoriali e il ruolo dei servizi sociali, senza indicare in ogni caso un importo preciso.\n\nIn materia ambientale la proposta è limitare il consumo di suolo, favorire la riqualificazione urbana e incentivare la mobilità sostenibile. Per la politica estera sostiene una maggiore autonomia diplomatica e privilegia il negoziato rispetto a un ulteriore aumento delle spese militari. L'obiettivo dichiarato è migliorare le condizioni delle persone senza confondere gli impegni programmatici con risultati già raggiunti." },
];
