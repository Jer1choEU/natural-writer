import type { M5SKnowledgeEntry } from "./types";

const energy = "nova-2026-energia-casa-scuola-digitale";
const justice = "nova-2026-giustizia-esteri-diritti";
const economy = "nova-2026-sanita-lavoro-economia";
const approvedAt = "2026-09-20";

function policy(
  id: string,
  title: string,
  summary: string,
  keywords: string[],
  sourceId: string
): M5SKnowledgeEntry {
  return {
    id,
    type: "policy",
    title,
    summary,
    keywords,
    sourceIds: [sourceId],
    status: "member-approved-policy",
    approvedAt,
  };
}

export const M5S_POLICIES_2026: M5SKnowledgeEntry[] = [
  policy("rinnovabili-sovranita-energetica", "Sovranità energetica e rinnovabili", "Aumentare fortemente la capacità da fonti rinnovabili per ridurre dipendenza e spesa per il gas.", ["rinnovabili", "energia", "gas", "sovranità energetica", "fotovoltaico"], energy),
  policy("prezzo-elettricita-gas", "Separare il prezzo delle rinnovabili da quello del gas", "Riformare la formazione del prezzo elettrico affinché l'energia rinnovabile non sia automaticamente agganciata al prezzo del gas, con protezione dei nuclei vulnerabili.", ["bollette", "prezzo energia", "gas", "elettricità", "nuclei vulnerabili"], energy),
  policy("stop-sussidi-fossili", "Superamento dei sussidi alle fonti fossili", "Rivedere gli oneri di sistema, superare progressivamente i sostegni alla generazione fossile e trasferire gli oneri in modo più equo.", ["fossili", "sussidi", "centrali", "energia", "oneri di sistema"], energy),
  policy("comunita-energetiche", "Comunità energetiche e autoconsumo", "Semplificare autoconsumo ed energia condivisa e accelerare reti, accumuli e connessioni.", ["comunità energetiche", "autoconsumo", "accumuli", "rete elettrica"], energy),
  policy("fotovoltaico-superfici-occupate", "Rinnovabili prioritariamente su superfici già utilizzate", "Favorire fotovoltaico su tetti, edifici pubblici, capannoni, parcheggi e altre superfici già impermeabilizzate.", ["fotovoltaico", "tetti", "capannoni", "parcheggi", "consumo di suolo"], energy),

  policy("piano-nazionale-abitare", "Piano nazionale dell'abitare", "Aumentare l'offerta abitativa pubblica e programmare gli interventi su scala nazionale con risorse adeguate agli enti territoriali.", ["casa", "abitare", "edilizia pubblica", "alloggi", "erp"], energy),
  policy("case-sfitte-affitti-calmierati", "Rimettere in uso le case sfitte", "Promuovere convenzioni tra proprietari ed enti territoriali per affitti calmierati, garanzie pubbliche e recupero dello stock abitativo inutilizzato.", ["case sfitte", "affitti", "affitto", "canone", "locazione"], energy),
  policy("morosita-incolpevole", "Prevenzione degli sfratti per morosità incolpevole", "Finanziare stabilmente gli strumenti di sostegno alla locazione e alla morosità incolpevole.", ["sfratto", "morosità", "affitto", "locazione"], energy),
  policy("recupero-edilizia-esistente", "Recuperare prima di costruire", "Riqualificare edilizia pubblica e sociale e patrimonio esistente prima di nuovo consumo di suolo.", ["rigenerazione", "edilizia", "riqualificazione", "consumo di suolo", "case popolari"], energy),

  policy("scuola-investimenti", "Investimenti strutturali nella scuola", "Destinare risorse a sicurezza degli edifici, laboratori, impianti sportivi, mense e spazi educativi.", ["scuola", "edilizia scolastica", "laboratori", "mense", "impianti sportivi"], energy),
  policy("stabilizzazione-scuola", "Contrasto alla precarietà nella scuola", "Stabilizzare cattedre e organici ATA e rafforzare il sostegno con personale formato.", ["docenti", "ata", "precariato scuola", "insegnanti", "sostegno"], energy),
  policy("asili-nido-universali", "Asili nido universali", "Rendere il nido un servizio educativo universale, accessibile alle famiglie e presente in ogni territorio.", ["asili", "nido", "nidi", "infanzia", "famiglie"], energy),
  policy("educazione-digitale", "Educazione digitale", "Formare a uso consapevole di IA e social, privacy, contrasto alla disinformazione e al cyberbullismo.", ["educazione digitale", "ia", "social", "privacy", "cyberbullismo", "disinformazione"], energy),
  policy("diritto-studio-universitario", "Diritto allo studio universitario", "Aumentare residenze pubbliche e alloggi calmierati, garantire borse agli idonei e ampliare la no tax area.", ["università", "studenti", "borse di studio", "residenze", "diritto allo studio"], energy),

  policy("adattamento-climatico", "Fondo permanente per l'adattamento climatico", "Attuare il piano nazionale di adattamento e integrare il rischio climatico nella programmazione pubblica.", ["clima", "adattamento", "rischio climatico", "alluvioni", "siccità"], energy),
  policy("sicurezza-territorio", "Piano pluridecennale per la sicurezza del territorio", "Programmare bonifiche, contrasto al dissesto idrogeologico, sicurezza sismica e difesa delle coste.", ["dissesto", "bonifiche", "sisma", "coste", "erosione", "territorio"], energy),
  policy("acqua-reti", "Riduzione delle perdite idriche", "Ridurre dispersioni delle reti, migliorare invasi, raccolta e riuso dell'acqua con manutenzione stabile.", ["acqua", "perdite idriche", "rete idrica", "invasi", "siccità"], energy),
  policy("rigenerazione-urbana-verde", "Rigenerazione urbana e verde", "Recuperare città e quartieri senza nuovo consumo di suolo, con piani del verde, de-impermeabilizzazione e infrastrutture naturali.", ["verde urbano", "quartiere", "rigenerazione urbana", "cemento", "asfalto", "città spugna"], energy),

  policy("pluralismo-media", "Pluralismo e trasparenza dei media", "Ridurre progressivamente i contributi diretti all'editoria e rafforzare trasparenza della proprietà, autonomia giornalistica e pluralismo.", ["editoria", "giornali", "media", "pluralismo", "informazione"], energy),
  policy("rai-indipendente", "Servizio pubblico radiotelevisivo indipendente", "Rendere la governance RAI più indipendente da governo e maggioranze attraverso nomine trasparenti e criteri di competenza.", ["rai", "servizio pubblico", "televisione", "nomine", "informazione"], energy),
  policy("tutela-minori-social", "Tutela dei minori sulle piattaforme", "Prevedere verifica dell'età e limitazioni automatiche ai meccanismi che favoriscono uso compulsivo dei social per i minorenni.", ["minori", "social", "piattaforme", "dipendenza digitale", "verifica età"], energy),
  policy("ia-pubblica", "Intelligenza artificiale pubblica e indipendente", "Sviluppare capacità pubbliche di IA per ridurre la dipendenza esclusiva dalle grandi multinazionali tecnologiche.", ["intelligenza artificiale", "ia pubblica", "big tech", "sovranità digitale"], energy),

  policy("antimafia-strutture", "Rafforzare le strutture antimafia", "Potenziare Direzione nazionale e Direzioni distrettuali antimafia, coordinamento e specializzazione investigativa.", ["antimafia", "mafia", "criminalità organizzata", "dda", "dna"], justice),
  policy("whistleblower", "Protezione di chi denuncia corruzione e illegalità", "Garantire anonimato, canali indipendenti e tutela effettiva contro ritorsioni per chi segnala illeciti.", ["whistleblower", "corruzione", "segnalanti", "illegalità", "ritorsioni"], justice),
  policy("conflitto-interessi", "Legge sul conflitto di interessi", "Introdurre incompatibilità, obblighi di astensione e strumenti efficaci contro la commistione tra interessi economici e funzioni pubbliche.", ["conflitto di interessi", "incompatibilità", "affari", "funzioni pubbliche"], justice),
  policy("regolazione-lobby", "Regolamentazione delle lobby", "Rendere trasparenti incontri, interessi rappresentati e influenza esercitata sulle decisioni pubbliche.", ["lobby", "lobbismo", "trasparenza", "interessi"], justice),
  policy("polizia-prossimita", "Polizia di prossimità", "Rafforzare presìdi di quartiere, organici, pattugliamenti, formazione e mezzi per una presenza pubblica più vicina ai cittadini.", ["sicurezza", "polizia", "quartiere", "presidio", "pattuglie"], justice),
  policy("sicurezza-prevenzione-sociale", "Prevenire il disagio prima della criminalità", "Affiancare alla sicurezza investimenti in scuola, servizi, sport, educatori di strada e spazi pubblici contro marginalità e dispersione scolastica.", ["sicurezza", "degrado", "marginalità", "educatori di strada", "dispersione scolastica"], justice),
  policy("cannabis-coltivazione-personale", "Depenalizzazione della coltivazione domestica di cannabis per uso personale", "Depenalizzare la coltivazione domestica della cannabis destinata all'uso personale.", ["cannabis", "coltivazione domestica", "legalizzazione", "depenalizzazione"], justice),

  policy("diritto-internazionale", "Primato del diritto internazionale", "Riaffermare il primato del diritto internazionale e tutelare l'indipendenza di chi opera nella giustizia internazionale.", ["diritto internazionale", "corte internazionale", "tribunale internazionale"], justice),
  policy("cooperazione-disarmo", "Cooperazione multilaterale e disarmo", "Promuovere percorsi internazionali di sicurezza e pace fondati su cooperazione, multilateralismo e piani condivisi di disarmo.", ["disarmo", "pace", "helsinki", "multilateralismo", "cooperazione"], justice),
  policy("no-rearm-eu", "Contrarietà a Rearm EU", "Opporsi al piano Rearm EU, sostenendo invece politica estera comune e una difesa europea comune con controllo democratico e risparmi di scala.", ["rearm eu", "difesa europea", "riarmo", "spesa militare"], justice),
  policy("no-nato-5-percento", "Contrarietà all'obiettivo NATO del 5% del PIL", "Opporsi all'innalzamento della spesa per la difesa al 5% del PIL, cercando obiettivi compatibili con la sostenibilità del modello sociale.", ["nato", "5%", "spesa difesa", "spesa militare", "pil"], justice),
  policy("ucraina-negoziato", "Svolta negoziale sulla guerra in Ucraina", "Superare la prosecuzione dell'invio di armi come strategia e puntare su un negoziato che tuteli le ragioni del paese aggredito con coinvolgimento internazionale.", ["ucraina", "armi", "negoziato", "russia", "guerra"], justice),
  policy("palestina-riconoscimento", "Riconoscimento dello Stato di Palestina", "Sostenere il riconoscimento dello Stato di Palestina e iniziative politiche, economiche e diplomatiche verso Israele coerenti con la tutela del diritto internazionale e dei civili.", ["palestina", "gaza", "israele", "cisgiordania", "riconoscimento palestina"], justice),

  policy("migrazione-programmata", "Superare Bossi-Fini e click day", "Programmare ingressi legali in base alle necessità reali di lavoro, contrastando clandestinità, sfruttamento e caporalato.", ["immigrazione", "bossi fini", "click day", "ingressi legali", "migranti"], justice),
  policy("ius-scholae", "Ius Scholae", "Riconoscere un percorso alla cittadinanza per chi studia nelle scuole italiane ed è parte della comunità.", ["ius scholae", "cittadinanza", "scuola", "immigrati", "seconde generazioni"], justice),
  policy("redistribuzione-europea-migranti", "Accoglienza europea solidale", "Superare il peso esclusivo sui Paesi di primo arrivo con un meccanismo europeo obbligatorio e solidale di redistribuzione.", ["migranti", "accoglienza", "europa", "redistribuzione", "dublino"], justice),
  policy("corridoi-umanitari", "Corridoi umanitari e procedure sicure", "Rafforzare canali sicuri per chi ha diritto alla protezione e procedure di asilo rapide e ordinate.", ["corridoi umanitari", "asilo", "rifugiati", "protezione internazionale"], justice),
  policy("integrazione-migranti", "Piano nazionale per l'integrazione", "Rafforzare lingua, formazione professionale, mediazione culturale, scuola, sport e inserimento lavorativo regolare.", ["integrazione", "migranti", "lingua italiana", "mediatori culturali"], justice),

  policy("iniziativa-popolare-voto", "Obbligo di esame delle leggi di iniziativa popolare", "Le proposte popolari con un numero significativo di firme devono essere discusse e votate dal Parlamento entro tempi definiti.", ["iniziativa popolare", "firme", "parlamento", "legge popolare"], justice),
  policy("bilancio-partecipativo", "Bilanci partecipativi", "Introdurre strumenti permanenti che consentano ai cittadini di incidere su una parte delle scelte di spesa di Regioni e Comuni.", ["bilancio partecipativo", "comune", "regione", "partecipazione"], justice),
  policy("referendum-quorum", "Referendum più accessibili", "Ridurre a un terzo degli aventi diritto il quorum per la validità dei referendum abrogativi.", ["referendum", "quorum", "democrazia diretta"], justice),
  policy("matrimonio-egualitario", "Matrimonio egualitario", "Garantire alle coppie gli stessi diritti, doveri e dignità davanti alla legge indipendentemente dall'orientamento sessuale.", ["matrimonio egualitario", "matrimonio", "lgbt", "coppie omosessuali"], justice),
  policy("legge-omolesbobitransfobia", "Contrasto all'omolesbobitransfobia", "Prevedere una tutela specifica contro violenze e discriminazioni fondate su orientamento sessuale o identità di genere.", ["omofobia", "transfobia", "omolesbobitransfobia", "lgbt", "discriminazioni"], justice),
  policy("adozioni-omogenitoriali", "Adozioni per coppie omogenitoriali", "Riconoscere e tutelare famiglie e legami affettivi esistenti mettendo al centro l'interesse dei bambini.", ["adozioni", "omogenitorialità", "famiglie arcobaleno", "coppie omogenitoriali"], justice),
  policy("fine-vita", "Legge sul fine vita", "Introdurre una disciplina legislativa nazionale sul fine vita.", ["fine vita", "eutanasia", "suicidio assistito"], justice),
  policy("diritti-digitali", "Diritti digitali", "Rafforzare garanzie su dati personali, profilazione, biometria e IA e assicurare accesso alle tecnologie e alle competenze digitali.", ["diritti digitali", "privacy", "dati biometrici", "profilazione", "ia"], justice),

  policy("ssn-nazionale", "Rafforzare il carattere nazionale del SSN", "Ridurre le diseguaglianze territoriali attraverso maggiore coordinamento statale del Servizio sanitario nazionale.", ["ssn", "sanità", "regioni", "titolo v", "sanità regionale"], economy),
  policy("liste-attesa", "Tempi certi per visite, esami e interventi", "Stabilire soglie massime nazionali per le attese e strumenti di intervento quando il servizio regionale non riesce a garantirle.", ["liste d'attesa", "visite", "esami", "interventi", "sanità"], economy),
  policy("sanita-risorse-personale", "Più risorse e personale per il SSN", "Superare i tetti alle assunzioni, reclutare personale e aumentare strutturalmente il finanziamento del servizio sanitario pubblico.", ["medici", "infermieri", "sanità", "assunzioni", "finanziamento ssn"], economy),
  policy("prevenzione-sanitaria", "Prevenzione come investimento", "Trattare gli investimenti in prevenzione sanitaria come spesa strategica per salute e sostenibilità futura del SSN.", ["prevenzione", "sanità", "salute pubblica"], economy),

  policy("salario-minimo", "Salario minimo legale", "Introdurre una soglia salariale dignitosa, indicizzata e coordinata con la contrattazione collettiva maggiormente rappresentativa.", ["salario minimo", "stipendio", "retribuzione", "contrattazione"], economy),
  policy("contratti-termine", "Contrasto alla precarietà", "Regolare i contratti a termine con causali chiare e aggiornare le tutele del lavoro al nuovo contesto economico e tecnologico.", ["precariato", "contratti a termine", "lavoratori", "statuto lavoratori"], economy),
  policy("riduzione-orario", "Riduzione dell'orario a parità di salario", "Favorire riduzione dell'orario di lavoro, smart working e diritto alla disconnessione senza riduzione salariale.", ["orario di lavoro", "settimana corta", "smart working", "disconnessione", "parità di salario"], economy),
  policy("sicurezza-lavoro", "Sicurezza sul lavoro", "Rafforzare strumenti nazionali dedicati alla sicurezza del lavoro e le garanzie anche lungo le catene di subappalto.", ["sicurezza sul lavoro", "morti sul lavoro", "subappalto", "procura nazionale"], economy),
  policy("gender-pay-gap", "Parità salariale di genere", "Contrastare il divario retributivo di genere e garantire pari opportunità di carriera.", ["gender pay gap", "parità salariale", "donne", "carriera"], economy),
  policy("reddito-20", "Riforma delle misure di inclusione e sostegno", "Rivedere Assegno di inclusione e Supporto per la formazione e il lavoro per colmare carenze e inefficienze.", ["reddito di cittadinanza", "assegno di inclusione", "supporto formazione lavoro", "povertà"], economy),
  policy("caregiver", "Tutele economiche e previdenziali per caregiver", "Riconoscere economicamente il lavoro di cura e garantire copertura previdenziale e servizi a chi assiste familiari.", ["caregiver", "cura", "disabilità", "assistenza familiare"], economy),

  policy("irpef-progressiva", "IRPEF più progressiva", "Ridurre il carico sui redditi bassi e medi, ampliare la no tax area e neutralizzare il fiscal drag.", ["irpef", "tasse", "no tax area", "redditi bassi", "fiscal drag"], economy),
  policy("extraprofitti", "Tassazione degli extraprofitti", "Tassare rendite eccezionali generate da shock esterni o posizioni dominanti, inclusi grandi operatori finanziari, energetici e digitali.", ["extraprofitti", "banche", "energia", "assicurazioni", "big tech", "tasse"], economy),
  policy("tassazione-speculazione", "Spostare il prelievo da lavoro e impresa alla speculazione", "Alleggerire progressivamente attività produttive e lavoro e aumentare il prelievo sulle grandi attività finanziarie e speculative.", ["speculazione", "tasse lavoro", "tasse impresa", "finanza"], economy),
  policy("evasione-dati-ia", "Strategia nazionale contro l'evasione", "Incrociare dati fiscali e pagamenti anche con strumenti di IA, mantenendo controllo umano, privacy e diritto di contestazione.", ["evasione", "fattura elettronica", "pagamenti digitali", "ia", "fisco"], economy),
  policy("pmi-banca-pubblica", "Finanza pubblica per PMI", "Rafforzare strumenti pubblici di capitalizzazione, credito, garanzia e microcredito per piccole imprese, professionisti e autonomi.", ["pmi", "microcredito", "banca pubblica", "credito", "professionisti", "autonomi"], economy),
  policy("pa-semplificazione-imprese", "Sportello digitale unico per le imprese", "Semplificare pratiche, autorizzazioni e contributi evitando di richiedere più volte dati già posseduti dalla pubblica amministrazione.", ["imprese", "burocrazia", "sportello unico", "pubblica amministrazione", "autorizzazioni"], economy),
];
