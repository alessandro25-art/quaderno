# Obiettivo V2: domande pensate per la sera

## Perché

Feedback dell'utente (04/08): fa journaling **di notte**, prima di dormire. Le domande che
chiedono azioni immediate ("che cosa posso fare nelle prossime due ore") non hanno senso la
sera — nelle prossime due ore dorme. Il micro-passo generico ("una cosa che dipende da me")
non lo convince. La chiusura "Cosa posso lasciare non risolto fino a domani?" risulta strana
perché fatta la sera, senza capirne lo scopo.

## Cosa piace all'utente (da preservare)

- Domande di riflessione sulla giornata (es. "pensa a un momento recente in cui avresti voluto
  reagire diversamente" — rescripting).
- La domanda "dell'amico" del mercoledì (self-distancing: "Che cosa mi direbbe un amico che mi
  vuole bene?").
- La sezione "Una cosa di cui sono soddisfatto".
- Il tipo di domanda in generale: riflessiva, non "cosa fai adesso".

## Criteri di completamento

- [x] **Regola serale**: nessuna domanda chiede azioni nelle ore successive né frammenti
      "urgenti" (prossime due ore, fra un'ora, subito adesso). Tutte riflettono sulla giornata
      o sul domani in modo calmo. Test automatico `is evening-friendly` la impone.
- [x] **Martedì (Watkins) riscritto in chiave serale**: "Se smetto di chiedermi 'perché' e mi
      chiedo 'che cosa posso fare di specifico, domani', che cosa rispondo?" e "Cosa mi è pesato
      oggi? E qual è il primo passo concreto, anche piccolo, che posso fare domani?".
- [x] **Micro-passo concreto**: "Il mio micro-passo per domani: che cosa farò, e quando?" —
      niente più "una cosa che dipende da me" (generico); il "quando" dà il gancio temporale.
- [x] **Chiusura serale con scopo chiaro**: "Che cosa posso lasciar andare stasera, per dormire
      tranquillo?" — il senso è l'appoggio serale delle preoccupazioni (anti-ruminazione
      notturna), non "risolvi entro domani".
- [x] **Verifica**: 46 test verdi, lint pulito, build, smoke browser, deploy su GitHub Pages.
- [x] **Obiettivo documentato** in questo file.

## Definizione di fatto

Quando aprendo Quaderno la sera l'utente vede: una domanda riflessiva sulla giornata (nessuna
richiesta di azione immediata), una visualizzazione, un micro-passo concreto con "quando", una
chiusura che ha senso la notte ("lasciar andare per dormire"), una soddisfazione — tutto in
produzione e in italiano corretto.
