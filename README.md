# Quaderno

**Diario a mano, su iPad.** Scrivere con Apple Pencil su carta che non finisce mai.

Quaderno è una PWA local-first di journaling: la scrittura a mano resta sul dispositivo, una domanda al giorno guida senza obbligare, e il design è pensato per sembrare carta e inchiostro — non un'app.

## Come funziona

- **Una pagina al giorno, strutturata**: ogni domanda ha il **suo spazio di scrittura**. La pagina ha 5 sezioni: domanda riflessiva (tecnica del giorno), domanda di visualizzazione, micro-passo concreto ("che cosa farò, e quando?"), chiusura serale ("Che cosa posso lasciar andare stasera, per dormire tranquillo?"), "Una cosa di cui sono soddisfatto". Tutte le domande riflettono sulla giornata: l'app si usa la sera.
- **Domande basate su tecniche con evidenza**: rotazione settimanale — lunedì gratitudine (Emmons), martedì concretizzare (Watkins), mercoledì distanza (Kross), giovedì rileggere (Gross), venerdì savoring (Bryant), sabato osservare (Prochaska/DiClemente), domenica revisione gentile (Neff/King). Visualizzazione: BPS, lettera al sé futuro, esternalizzazione, sedia vuota, inner mentor, luogo sicuro e altre.
- **Zero giudizio**: nessun punteggio, nessuna streak, nessun conteggio. Le domande sono suggerimenti; nei giorni difficili basta una riga.
- **Quaderni multipli**: copertine, colori, pagine per data, archivio a calendario.
- **Inchiostro**: pressione e inclinazione della Pencil, 3 larghezze, 4 colori, evidenziatore, gomma, undo/redo, zoom 1–3×.
- **Solo penna**: il dito e il palmo non disegnano mai (touch-action pan-y: il dito scorre la pagina, la Pencil scrive).
- **Doppio tap della Pencil**: due tocchetti rapidi con la punta (o il doppio tap laterale, dove il sistema lo inoltra) alternano penna ↔ gomma.
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
- `docs/GOAL-QUESTIONS.md` — obiettivo delle domande (tecniche, spazi, grammatica);
- `/home/hermes/.hermes/journaling-books-research.md` — tecniche e libri (Cameron, Pennebaker, Emmons, stoicismo…);
- `/home/hermes/.hermes/journaling-techniques-research.md` — 10 tecniche con evidenza + revisione grammaticale;
- `/home/hermes/.hermes/journaling-visualization-research.md` — 23 tecniche di visualizzazione, 31 domande;
- `/home/hermes/.hermes/journaling-competitive-research.md` — competitor e tecnologie handwriting;
- `/home/hermes/.hermes/journaling-ux-architecture.md` — specifica UX e architettura.
