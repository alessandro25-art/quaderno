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

### Ciclo 1 — ricerca + QA manuale automatico
- Ricerca parallela completata: competitor (13 app), libri (20 autori), piattaforma iPad/PWA.
- QA profondo `scripts/qa-deep.mjs`: 30 check, emulazione iPad, tutti i flussi. 30/30 verde, zero errori console.
- Fix: etichette colori in italiano, Archivio→Impostazioni, back con memoria, foglio applicato alle pagine vuote, copertina centrata, card Privacy wide, select tematizzate, contrasti WCAG, `:active` feedback, undo/redo state, colori sempre visibili, `touch-action: none` (penna affidabile), screenshot fullPage rimosso (rompeva il canvas con dvh).

### Ciclo 2 — critica esterna + feature
- UX critique (10 problemi, 5 micro-interazioni, 4 incoerenze, 3 wow) e bug audit (24 bug) completati.
- Implementate: capolettera fantasma, sfoglio animato, landscape ampio (media query + `--section-height`), toast fisso, colore del giorno, archivio su ultimo mese scritto, badge "2/5 ✍️", «In questo giorno» (subYears, bisestile ok), filtro archivio per tecnica, promemoria serale, micro-copy anti-perfezionismo (7 varianti), 14 domande nuove dai libri (49 totali).

### Ciclo 3 — fix critici del bug audit (deployato e verificato live)
- persistStrokes con coda serializzata (niente race, niente tratti persi)
- Undo manager per sezione (sopravvive al cambio domanda) + copie safe
- API key esclusa dai backup + conservata all'import (test dedicato)
- API key in header `X-Goog-Api-Key`, mai nell'URL (test aggiornato)
- Primo tap del doppio tap ritardato 450ms (niente puntini orfani nel DB)
- Merge dei tratti scritti durante il caricamento + try/catch su createPage e salvataggi
- Avviso mezzanotte, maxLength titolo, catch su storage.estimate
- Verifica: 48 test verdi, lint pulito, QA 30/30, smoke 3/3 consecutivi, CI verde, smoke sul live OK.

## Stato

Cicli 1-3 completati e in produzione. Loop ancora aperto: prossimi candidati dal report
(mini-calendario a tendina, classic mode, Year in Pages, OffscreenCanvas, pinch zoom,
throttle 120Hz) — da schedulare quando l'utente lo chiede.

