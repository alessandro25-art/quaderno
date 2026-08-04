# Obiettivo: Quaderno perfetta — loop continuo di perfezionamento

## Perché

L'utente vuole che Quaderno diventi l'app perfetta: usarla come un utente reale, trovare
ogni bug, ogni pixel storto, ogni feature mancante. Confronto con le migliori app di
journaling e con la letteratura sul journaling. Reiterazione infinita: anche quando
sembra finita, sguardo critico e subagenti di controllo. "Devo poterla usare e deve
essere perfetta."

## Come (il loop)

1. **Usare l'app** come un utente vero (Playwright, emulazione iPad, tutti i flussi).
2. **Trovare bug** (console, funzionalità, edge case, persistenza, offline).
3. **Ricerca parallela** (subagenti): competitor, libri sul journaling, piattaforma
   iPad/PWA/Apple Pencil.
4. **Critica esterna** (subagenti con occhio critico sul risultato).
5. **Implementare**, testare, verificare in produzione.
6. **Ripetere** finché il report di critica non è pulito.

## Stato attuale (baseline)

- 46 test, lint pulito, smoke e2e (disegno, undo, touch bloccato, doppio tap, flusso guidato).
- Funzionalità: inchiostro Pencil (pressione/inclinazione), 5 sezioni una-per-pagina,
  domande con tecniche (rotazione settimanale), Kindle paper, OCR opzionale, PDF, backup,
  PWA offline, banner aggiornamento.

## Criteri di "perfetta" (da verificare a ogni ciclo)

- [ ] Zero errori console in ogni flusso
- [ ] Zero bug funzionali (persistenza, undo/redo, navigazione, giorni, quaderni)
- [ ] iPad reale: penna scrive sempre, palmo ignorato, doppio tap, scroll sensato
- [ ] Estetica Kindle/pen-and-paper coerente fino all'ultimo pixel
- [ ] Confronto competitor: ogni feature utile delle app migliori, adattata
- [ ] Contenuto domande: arricchito dalla letteratura sul journaling
- [ ] Accessibilità e micro-interazioni (stati vuoti, errori, conferme)
- [ ] Performance: avvio, passaggio domande, inchiostro fluido

## Log dei cicli

### Ciclo 1 — avvio
- Kickoff: ricerca (competitor, libri, piattaforma) + QA manuale automatico.
