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
];
