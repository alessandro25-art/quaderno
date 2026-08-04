# Quaderno

**Diario a mano, su iPad.** Scrivere con Apple Pencil su carta che non finisce mai.

Quaderno è una PWA local-first di journaling: la scrittura a mano resta sul dispositivo, una domanda al giorno guida senza obbligare, e il design è pensato per sembrare carta e inchiostro — non un'app.

## Come funziona

- **Una pagina al giorno**: data scritta in corsivo, domanda del giorno su un bigliettino, foglio a righe dove scrivi con la pencil, e in fondo il rituale stampato: micro-passo, "Cosa posso lasciare non risolto fino a domani?", "Una cosa di cui sono soddisfatto".
- **Zero giudizio**: nessun punteggio, nessuna streak, nessun conteggio. Le domande sono suggerimenti; nei giorni difficili basta una riga.
- **Quaderni multipli**: copertine, colori, pagine per data, archivio a calendario.
- **Inchiostro**: pressione e inclinazione della Pencil, 3 larghezze, 4 colori, evidenziatore, gomma, undo/redo, zoom 1–3×.
- **Fogli**: righe, quadretti, puntinato, bianco — per quaderno.
- **Export**: PDF della pagina, backup JSON completo con ripristino.
- **Riconoscimento scrittura (opzionale)**: attivalo pagina per pagina; serve una API key Google Cloud Vision (gratis fino a 1000 pagine/mese) che resta solo sul dispositivo. Spento di default.

## Limiti dichiarati

- Su iPad una web app **non può usare PencilKit** (il riconoscimento on-device di Apple è solo per app native): per questo il riconoscimento è cloud e opzionale.
- I dati vivono nell'IndexedDB del browser, legati all'URL: esporta spesso il backup.

## Sviluppo

```bash
npm install
npm run dev          # sviluppo
npm test             # 40 test vitest
npm run lint         # oxlint
npm run build        # build PWA
npm run smoke:e2e    # Playwright: disegno, undo, mobile, offline
npm run release:package
```

## Struttura

```text
src/
├── App.jsx                  # routing (copertina, quaderno, archivio, impostazioni)
├── components/InkCanvas.jsx # cattura pencil, layer, palm rejection, undo
├── data/
│   ├── store.js             # IndexedDB (Dexie) + backup/restore
│   └── questions.js         # 32 domande in 8 temi, deterministiche per data
├── domain/
│   ├── ink.js               # smoothing, larghezza, rendering, palm guard
│   ├── undo.js              # UndoManager a snapshot
│   ├── recognizer.js        # NoneRecognizer / CloudOCR (pluggabile)
│   └── pdf.js               # export PDF minimale senza dipendenze
└── views/
    ├── CoverView.jsx        # griglia quaderni
    ├── NotebookView.jsx     # pagina di oggi + toolbar
    ├── ArchiveView.jsx      # calendario
    └── SettingsView.jsx     # key OCR, backup, preferenze
```

## Documentazione

- `docs/GOAL.md` — obiettivo e principi;
- `/home/hermes/.hermes/journaling-books-research.md` — tecniche e libri (Cameron, Pennebaker, Emmons, stoicismo…);
- `/home/hermes/.hermes/journaling-competitive-research.md` — competitor e tecnologie handwriting;
- `/home/hermes/.hermes/journaling-ux-architecture.md` — specifica UX e architettura.
