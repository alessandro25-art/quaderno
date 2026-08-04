// Libreria di domande di journaling (dal report sui libri: Cameron, Pennebaker,
// Emmons, stoicismo, Bullet Journal). Le domande sono suggerimenti, mai obblighi:
// l'utente può sempre scrivere libero. Formulazioni non giudicanti.

export const QUESTION_THEMES = [
  'gratitudine', 'difficoltà', 'relazioni', 'abitudini', 'lavoro', 'sé', 'stoico', 'leggero',
]

export const QUESTIONS = [
  // Gratitudine
  { theme: 'gratitudine', text: 'Qualcosa di bello che ho notato oggi.' },
  { theme: 'gratitudine', text: 'Una persona che ha reso la mia giornata migliore.' },
  { theme: 'gratitudine', text: 'Cosa funziona bene nella mia vita in questo momento?' },
  { theme: 'gratitudine', text: 'Un piccolo piacere che oggi mi sono concesso.' },
  // Difficoltà
  { theme: 'difficoltà', text: 'Cosa mi sta pesando in questo momento?' },
  { theme: 'difficoltà', text: 'Cosa sto evitando, e come lo so?' },
  { theme: 'difficoltà', text: 'Qual è stata la parte più difficile di oggi?' },
  { theme: 'difficoltà', text: 'Cosa mi ha tolto energia oggi, e cosa me ne ha data?' },
  // Relazioni
  { theme: 'relazioni', text: 'Con chi mi sono sentito davvero connesso oggi?' },
  { theme: 'relazioni', text: 'A chi voglio bene, anche se non glielo dico?' },
  { theme: 'relazioni', text: 'Qualcuno ha fatto qualcosa di gentile per me, oggi?' },
  { theme: 'relazioni', text: 'Di chi ho sentito la mancanza?' },
  // Abitudini
  { theme: 'abitudini', text: 'Come mi sento nel corpo in questo momento?' },
  { theme: 'abitudini', text: 'Quale abitudine mi è venuta naturale oggi?' },
  { theme: 'abitudini', text: 'Cosa ho notato del mio rapporto con le mie abitudini in questo periodo?' },
  { theme: 'abitudini', text: 'Cosa facevo un anno fa in questo momento?' },
  // Lavoro
  { theme: 'lavoro', text: 'Qual è la cosa più importante che ho fatto oggi?' },
  { theme: 'lavoro', text: 'Cosa mi sta bloccando?' },
  { theme: 'lavoro', text: 'Di cosa sono più soddisfatto del mio lavoro, oggi?' },
  { theme: 'lavoro', text: 'Cosa posso delegare o semplificare?' },
  // Sé
  { theme: 'sé', text: 'Cosa so di me oggi che non sapevo un anno fa?' },
  { theme: 'sé', text: 'Se parlassi a me stesso come a un amico, cosa mi direi?' },
  { theme: 'sé', text: 'Quando mi sono sentito più me stesso, oggi?' },
  { theme: 'sé', text: 'Cosa vorrei che la mia giornata di domani avesse di questo?' },
  // Stoico / accettazione
  { theme: 'stoico', text: 'Cosa non dipende da me, oggi, e posso lasciar andare?' },
  { theme: 'stoico', text: 'Quale pensiero sto giudicando come negativo, ma potrebbe essere solo neutro?' },
  { theme: 'stoico', text: 'Cosa ho fatto oggi che era sotto il mio controllo?' },
  { theme: 'stoico', text: 'Se domani fosse il mio ultimo giorno, cosa farei di diverso?' },
  // Leggero
  { theme: 'leggero', text: 'Che sapore ha avuto oggi?' },
  { theme: 'leggero', text: 'Se oggi fosse un colore, quale sarebbe?' },
  { theme: 'leggero', text: 'Qual è il momento più bello di oggi?' },
  { theme: 'leggero', text: 'Cosa mi ha fatto sorridere, oggi?' },
]

export const CLOSING_QUESTION = 'Cosa posso lasciare non risolto fino a domani?'
export const SATISFACTION_PROMPT = 'Una cosa di oggi di cui sono soddisfatto:'
export const MICROSTEP_PROMPT = 'Micro-passo di domani: una cosa che dipende da me'

const DAY_MS = 86400000

/** Domanda deterministica per data: la stessa data ripropone la stessa domanda (stile One Line a Day). */
export function getQuestionOfDay(dateValue) {
  const epoch = Date.UTC(2026, 0, 1)
  const day = Math.floor((Date.parse(`${dateValue}T00:00:00Z`) - epoch) / DAY_MS)
  const index = ((day % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length
  return QUESTIONS[index]
}

/** Domanda di un giorno specifico, con tema. */
export function questionForDate(dateValue) {
  const question = getQuestionOfDay(dateValue)
  return { ...question, date: dateValue }
}

/** Temi con conteggio per la UI. */
export function themeCounts() {
  const counts = {}
  for (const theme of QUESTION_THEMES) counts[theme] = 0
  for (const q of QUESTIONS) counts[q.theme] += 1
  return counts
}
