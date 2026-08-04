# Obiettivo: Domande che aiutano davvero + spazi dedicati + italiano corretto

## Perché

L'utente ha chiesto tre cose: (1) domande nuove, basate su ricerca reale su ciò che aiuta a
visualizzare e a fare journaling efficace — non un riuso delle vecchie; (2) ogni domanda deve
avere il SUO spazio di scrittura nel foglio; (3) italiano grammaticalmente corretto (le domande
precedenti avevano errori).

## Ricerca

- `journaling-techniques-research.md` — 10 tecniche con evidenza (Pennebaker, Kross, Watkins,
  Gross, Emmons, Bryant, Prochaska/DiClemente, Neff, King) + revisione grammaticale delle 32 domande.
- `journaling-visualization-research.md` — 23 tecniche di visualizzazione con 31 domande e
  mappatura degli spazi (piccolo/medio/grande), incluse craving-as-wave e luogo sicuro
  (rilevanti per l'ex-dipendente, mai giudicanti).

## Criteri di completamento

- [x] **Domande riflessive**: 35 domande in 7 pool, rotazione settimanale per tecnica
      (lun → gratitudine, mar → concretizzare/Watkins, mer → distanza/Kross, gio → rileggere/Gross,
      ven → savoring/Bryant, sab → osservare/Prochaska, dom → revisione/Neff+King).
- [x] **Domande di visualizzazione**: 14 prompt in 7 coppie settimanali (BPS, lettera al sé futuro,
      esternalizzazione, rescripting, processo, copione, sedia vuota, sentiero, inner mentor,
      luogo sicuro, stanza delle possibilità, cena futura).
- [x] **Spazio dedicato per ogni domanda**: pagina a 5 sezioni (domanda media, visualizzazione
      grande, micro-passo/chiusura/soddisfazione piccole ma scritturabili), ogni sezione con il
      proprio canvas e i propri tratti salvati con tag `section` in IndexedDB.
- [x] **Italiano corretto**: errori noti rimossi (virgole prima di "oggi", frasi dichiarative
      al posto di interrogative, deissi ambigua "di questo", "mi direi" ripensato);
      test automatici che rifiutano i pattern grammaticali noti.
- [x] **Struttura stabile per data** (stessa domanda = stesso giorno, stile One Line a Day)
      e testata nei vitest.
- [x] Verifica completa: 45 test verdi, lint pulito, smoke browser (disegno, undo, mobile, offline).

## Definizione di fatto

Quando la struttura giornaliera mostra per ogni data: 1 domanda riflessiva (tecnica del giorno)
+ 1 domanda di visualizzazione (coppia settimanale) + rituale di chiusura, ognuna con il proprio
spazio di scrittura a mano, in italiano corretto — e tutto è in produzione su GitHub Pages.
