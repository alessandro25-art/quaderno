// Libreria di domande di journaling basata su tecniche con evidenza scientifica.
// Rotazione settimanale: ogni giorno della settimana ha la sua tecnica (Emmons,
// Watkins, Kross, Gross, Bryant, Prochaska/DiClemente, King/Neff), così la varietà
// è dentro la settimana e la struttura si ripete in modo familiare.
// La chiusura "Cosa posso lasciare non risolto fino a domani?" è l'ancora fissa.
// Ogni domanda ha il SUO spazio di scrittura dedicato nella pagina (size).

// getDay() di JS: 0 = domenica … 6 = sabato
export const WEEKLY_TECHNIQUES = [
  { day: 1, key: 'gratitudine', label: 'Gratitudine' },
  { day: 2, key: 'concreto', label: 'Concretizzare' },
  { day: 3, key: 'distanza', label: 'Distanza' },
  { day: 4, key: 'rilettura', label: 'Rileggere' },
  { day: 5, key: 'savoring', label: 'Savoring' },
  { day: 6, key: 'osservazione', label: 'Osservare' },
  { day: 0, key: 'revisione', label: 'Revisione' },
]

export const QUESTION_POOLS = {
  // Lunedì — Gratitudine (Emmons & McCullough 2003)
  gratitudine: [
    'Che cosa di bello ho notato oggi?',
    'Chi ha reso la mia giornata migliore oggi?',
    'Cosa ha funzionato oggi, che avrebbe potuto andare peggio, e cosa posso apprezzare di questo?',
    'Quale piccolo piacere mi sono concesso oggi?',
    'Cosa funziona bene nella mia vita, in questo momento?',
    'Cosa c’era di bello in qualcosa che oggi ho giudicato brutto? Provo a cercare una crepa di luce.',
  ],
  // Martedì — Processing concreto contro ruminazione (Watkins 2008).
  // Versioni serali: riflettono sulla giornata, mai su azioni nelle ore successive.
  concreto: [
    'Se smetto di chiedermi "perché" e mi chiedo "che cosa posso fare di specifico, domani", che cosa rispondo?',
    'Quale dettaglio concreto di oggi ho trascurato, e che cosa mi dice?',
    'Cosa mi è pesato oggi? E qual è il primo passo concreto, anche piccolo, che posso fare domani?',
    'Qual è la cosa più importante che ho fatto oggi?',
    'Cosa posso delegare o semplificare?',
    'Quale decisione ho preso oggi senza pensarci, che meriterebbe un momento di attenzione?',
    'Quale abitudine, oggi, ha lavorato per me: una cosa che faccio senza pensarci e che mi ha fatto bene?',
  ],
  // Mercoledì — Self-distancing / prospettiva dell'osservatore (Kross 2014)
  distanza: [
    'Se un osservatore esterno vedesse la mia situazione di oggi, che cosa noterebbe che io non vedo?',
    'Che cosa mi direbbe un amico che mi vuole bene?',
    'Se guardassi la mia giornata da fuori, come un film, che cosa noterei?',
    'Con chi, oggi, mi sono sentito davvero connesso?',
    'Di chi ho sentito la mancanza?',
    'Che cosa mi ha infastidito oggi, e se provassi a guardarlo con gli occhi di uno spettatore curioso, che cosa noterei di diverso?',
    'Oggi ho pensato a qualcuno che non vedo da tempo. Chi era? Quale ricordo preciso mi è tornato?',
  ],
  // Giovedì — Cognitive reappraisal (Gross 1998)
  rilettura: [
    'Se tra un anno ripenso a oggi, che cosa mi sembrerà meno grave di quanto mi sembri ora?',
    'Quale situazione di oggi posso vedere da un’altra angolazione, e che cosa cambia?',
    'Quale pensiero sto giudicando come negativo, ma potrebbe essere solo neutro?',
    'Cosa non dipende da me oggi, e posso lasciar andare?',
    'Cosa ho fatto oggi che era sotto il mio controllo?',
    'Quale conversazione di oggi, se potessi riscriverla, cambierei? E come?',
  ],
  // Venerdì — Savoring (Bryant 2003)
  savoring: [
    'Qual è un momento di oggi che voglio conservare, e quali dettagli precisi lo rendono prezioso?',
    'Cosa ho assaporato oggi con tutti i sensi, anche solo per pochi secondi?',
    'Qual è il momento più bello di oggi?',
    'Quale persona ha reso più dolce la mia giornata, e perché?',
    'Cosa mi ha fatto sorridere oggi?',
    'Cosa mi ha fatto rallentare oggi, anche solo per un respiro, e che cosa ho visto in quel momento?',
    'Qual è il suono che ricordo di più di oggi: una voce, un silenzio, un rumore di sottofondo?',
    'Cosa ho fatto oggi che era solo mio: non per dovere, non per compiacere, ma perché lo volevo davvero?',
  ],
  // Sabato — Decisional balance non giudicante (Prochaska & DiClemente 1983)
  osservazione: [
    'Se osservassi questa abitudine come farebbe un biologo con una pianta, senza giudizio, che cosa noterei oggi che prima non vedevo?',
    'Quale funzione sta svolgendo per me questa abitudine, in questo preciso momento della mia vita?',
    'Cosa ho notato, in questo periodo, del mio rapporto con le abitudini?',
    'Come mi sento nel corpo, in questo momento?',
    'Quale abitudine mi è venuta naturale oggi?',
    'Che cosa ho sentito nel corpo oggi — stanchezza, energia, tensione in un punto preciso — e in che momento l’ho notato per la prima volta?',
    'Quale pensiero è tornato più spesso oggi? Provo a seguirlo a ritroso: dov’è nato?',
    'Che cosa mi pesa da più giorni? Stasera provo solo a descriverlo, senza cercare di risolverlo.',
  ],
  // Domenica — Revisione gentile + Best Possible Self (Neff 2003, King 2001)
  revisione: [
    'Se questa settimana fosse un capitolo di un libro sulla mia vita, che titolo avrebbe?',
    'Quale versione di me sta già emergendo oggi, anche in piccoli gesti?',
    'Di che cosa ho bisogno in questo momento, e come posso concedermelo nella prossima settimana?',
    'Cosa di questa settimana voglio portare con me? E cosa posso lasciare qui?',
    'Cosa so di me oggi, che non sapevo un anno fa?',
    'Se tra cinque anni mi capitasse di leggere quello che scrivo stasera, che cosa vorrei che il me di allora capisse di me?',
    'Se dovessi dire una sola parola per descrivere questa settimana, quale sceglierei? E perché proprio quella?',
    'Qual è la cosa più vera che ho pensato questa settimana, quella che non ho detto a nessuno?',
    'Che cosa ho costruito questa settimana: un momento di calma, un legame più stretto, un’idea che prima non c’era?',
  ],
}

// Domande di visualizzazione: immagini mentali, scene, prospettive.
// Rotazione settimanale (dal report: BPS, esternalizzazione, processo,
// sedia vuota, inner mentor, luogo sicuro, stanza delle possibilità) —
// due alternative per giorno, scelta deterministica per data.
export const WEEKLY_VISUAL = {
  1: [
    'Chiudi gli occhi per un minuto. Immagina un giorno qualunque della tua vita, fra due anni, in cui tutto ha preso la direzione giusta. Dove ti svegli? Cosa vedi intorno a te? Chi c’è? Come ti muovi nella giornata? Scrivi la scena come se la stessi vivendo in questo momento.',
    'Scrivi una lettera a te stesso fra tre anni. Non un elenco di obiettivi, ma una lettera vera: raccontagli cosa stai attraversando ora, cosa speri per lui, cosa vorresti che ricordasse. Immagina il luogo in cui la leggerà: la luce nella stanza, il rumore di fondo, l’umore di quel giorno.',
  ],
  2: [
    'Pensa a qualcosa che ti ha disturbato di recente, un pensiero che torna, una sensazione scomoda. Immagina che non sia dentro di te, ma fuori. Che forma ha? È solido, liquido, gassoso? Di che colore è? Quanto è grande? Dove si trova rispetto a te? È fermo o si muove? Descrivilo come descriveresti un oggetto su un tavolo.',
    'Pensa a un momento recente in cui avresti voluto reagire diversamente. Visualizza la scena originale, fotogramma per fotogramma. Ora riscrivila: entra tu nella scena, ma con una risorsa che oggi hai e che allora non avevi. Cosa fai di diverso? Cosa dici? Come cambia la scena?',
  ],
  3: [
    'Immagina di dover preparare qualcosa di importante per te (un progetto, una conversazione, una scelta). Non pensare al risultato. Visualizza il processo: il momento in cui inizi, l’ambiente intorno, la prima azione concreta che fai, l’ostacolo a metà strada, come lo aggiri. Scrivilo come una sceneggiatura: ogni scena, ogni gesto.',
    'Nei prossimi giorni c’è una situazione che ti mette un po’ a disagio (una telefonata, un incontro, un momento in cui vorresti dire qualcosa di preciso). Immagina di viverla esattamente come vorresti: il luogo, la luce, la postura del tuo corpo, le prime parole che dici. Scrivi la scena come un copione. Poi rileggila a voce alta.',
  ],
  4: [
    'Immagina che di fronte a te, su un’altra sedia, sia seduta la parte di te che ha più paura in questo momento. Come è seduta? Le gambe accavallate? Le mani in grembo? Ti guarda o guarda altrove? Chiedile: «Di cosa hai bisogno?» e scrivi la risposta che ti dà, con la sua voce, non con la tua.',
    'Immagina di essere su un sentiero che conosci bene o che inventi in questo momento. Cammini. Cosa vedi ai lati? Che stagione è? A un certo punto incontri un oggetto sul cammino che non ti aspettavi. Lo raccogli. Cos’è? Scrivi la scena come se la stessi attraversando ora.',
  ],
  5: [
    'Immagina una versione di te che ha già attraversato questo periodo e ne è uscita più serena. Che età ha? Come si veste? In che luogo ti aspetta? Fatti dire da quella persona: «Cosa hai bisogno di sentire in questo momento?» Poi scrivi la risposta che lei ti dà, con le sue parole esatte.',
    'In quella versione futura di te, qual è il gesto più piccolo e quotidiano che oggi non fai ma che allora sarà diventato naturale? Descrivilo con i dettagli fisici: le mani, la luce, l’ora del giorno.',
  ],
  6: [
    'Descrivi il tuo luogo sicuro. Non deve esistere davvero: puoi inventarlo. Entraci ora: cosa vedi appena varcata la soglia? Che luce c’è? Che odore? C’è un posto dove sederti? Cosa senti sotto le dita? Cosa c’è fuori dalla finestra, se c’è una finestra? Più dettagli scrivi, più il luogo diventa reale.',
    'Scegli un piccolo traguardo personale. Chiudi gli occhi e immagina di averlo raggiunto. Com’è la scena? C’è qualcuno con te? Che ora del giorno è? Cosa fai subito dopo? Scrivi la scena al presente.',
  ],
  0: [
    'Immagina una stanza vuota con diverse porte. Su ogni porta c’è scritta una parola: «Leggerezza», «Avventura», «Calma», «Legame», «Curiosità». Scegline una, quella che ti chiama oggi. Aprila. Cosa vedi? Entra e guardati intorno: chi c’è, che luce c’è, cosa stai facendo? Scrivi la scena.',
    'Immagina di partecipare, molti anni da oggi, a una cena con le persone a cui vuoi bene. Qualcuno si alza e dice qualcosa su di te: non un elogio formale, ma un ricordo vero, un piccolo momento condiviso. Cosa racconta? Descrivi la scena: la stanza, la luce, le facce.',
    'Se oggi fosse una fotografia, cosa ci vedrei nell’inquadratura? E che cosa è rimasto fuori?',
  ],
}

export const VISUAL_QUESTIONS = Object.entries(WEEKLY_VISUAL)
  .flatMap(([day, texts]) => texts.map((text) => ({ theme: 'immagine', day: Number(day), text })))

// Rituale di chiusura pensato per la sera: il senso è "appoggio qui le
// preoccupazioni e vado a dormire", non "risolvo entro domani".
export const CLOSING_QUESTION = 'Che cosa posso lasciar andare stasera, per dormire tranquillo?'
export const SATISFACTION_PROMPT = 'Una cosa di oggi di cui sono soddisfatto:'
// Micro-passo concreto: non "una cosa che dipende da me" (generico), ma una
// cosa precisa con l'ora in cui verrà fatta — così ha un gancio nel domani.
export const MICROSTEP_PROMPT = 'Il mio micro-passo per domani: che cosa farò, e quando?'

const DAY_MS = 86400000

function pickForDate(dateValue, pool) {
  const epoch = Date.UTC(2026, 0, 1)
  const day = Math.floor((Date.parse(`${dateValue}T00:00:00Z`) - epoch) / DAY_MS)
  const index = ((day % pool.length) + pool.length) % pool.length
  return pool[index]
}

/** Tecnica del giorno in base al giorno della settimana. */
export function techniqueForDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00Z`)
  const day = date.getUTCDay()
  return WEEKLY_TECHNIQUES.find((entry) => entry.day === day)
}

/** Domanda riflessiva deterministica: tecnica del giorno + pool della tecnica. */
export function getQuestionOfDay(dateValue) {
  const technique = techniqueForDate(dateValue)
  const pool = QUESTION_POOLS[technique.key]
  const text = pickForDate(dateValue, pool)
  return { text, theme: technique.key, technique: technique.label }
}

/** Domanda di visualizzazione deterministica: tecnica del giorno + alternativa per data. */
export function getVisualizationOfDay(dateValue) {
  const technique = techniqueForDate(dateValue)
  const pool = WEEKLY_VISUAL[technique.day] ?? WEEKLY_VISUAL[0]
  const epoch = Date.UTC(2026, 0, 1)
  const day = Math.floor((Date.parse(`${dateValue}T00:00:00Z`) - epoch) / DAY_MS)
  const index = ((day % pool.length) + pool.length) % pool.length
  return { text: pool[index], theme: 'immagine', technique: 'Visualizzazione' }
}

/** Struttura giornaliera: 2 domande con spazio dedicato + rituale di chiusura. */
export function getDailyStructure(dateValue) {
  const main = getQuestionOfDay(dateValue)
  const visual = getVisualizationOfDay(dateValue)
  return [
    { id: 'q1', label: 'Domanda del giorno', text: main.text, theme: main.technique, size: 'medium' },
    { id: 'q2', label: 'Visualizzazione', text: visual.text, theme: visual.technique, size: 'large' },
    { id: 'q3', label: 'Micro-passo', text: MICROSTEP_PROMPT, theme: 'Azione', size: 'small' },
    { id: 'q4', label: 'Chiusura', text: CLOSING_QUESTION, theme: 'Azione', size: 'small' },
    { id: 'q5', label: 'Soddisfazione', text: SATISFACTION_PROMPT, theme: 'Azione', size: 'small' },
  ]
}

export const QUESTIONS = Object.values(QUESTION_POOLS).flat().map((text) => ({ text }))
export const QUESTION_THEMES = WEEKLY_TECHNIQUES.map((entry) => entry.key)

export function themeCounts() {
  const counts = {}
  for (const [key, pool] of Object.entries(QUESTION_POOLS)) counts[key] = pool.length
  return counts
}
