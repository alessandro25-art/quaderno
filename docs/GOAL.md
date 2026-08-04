# Obiettivo Quaderno v0.1

## Obiettivo misurabile

Una PWA di journaling per iPad con Apple Pencil che si senta **come un quaderno di carta**: si scrive a mano, una domanda al giorno guida senza obbligare, e nulla esce dal dispositivo — tranne quando l'utente lo decide (export PDF, backup, riconoscimento cloud opzionale).

## Principi (dal report sui libri)

- **Mai giudicante**: zero punteggi, zero streak, zero "counting days" (l'utente è ex-fumatore/ex-consumatore: le ricadute non sono fallimenti, si osservano).
- **1 domanda + micro-passo**: struttura quotidiana leggera, chiusura con "Cosa posso lasciare non risolto fino a domani?".
- **Flessibilità**: nei giorni difficili basta una riga; la domanda è un suggerimento, mai un obbligo.
- **Privacy locale**: IndexedDB, nessun account; il riconoscimento scrittura è cloud ma **default spento** e per-pagina.

## Tecniche implementate (miscela dai report)

1. Domanda del giorno + spazio libero (Mini Morning Pages, Cameron) — 32 domande in 8 temi, deterministiche per data.
2. Micro-passo quotidiano stampato in fondo alla pagina (Stoicismo/Bullet Journal).
3. Rito di chiusura stoico-adattivo: "Cosa posso lasciare non risolto fino a domani?" + "Una cosa di cui sono soddisfatto".
4. Revisione non giudicante: rileggere dal calendario archivio, nessuna metrica di giudizio.

## Feature tecniche

- **Inchiostro**: canvas + Pointer Events, pressione e tilt della Pencil, smoothing a media mobile, larghezza modulata, evidenziatore, gomma a stroke, undo/redo (50 snapshot), zoom 1–3×, palm rejection.
- **Carta**: 4 tipi di foglio (righe, quadretti, puntinato, bianco), texture carta, rilegatura, bigliettino con la domanda.
- **Dati**: IndexedDB (notebook, pages, strokes, questions, settings), una pagina per giorno, backup/restore JSON con schema versionato.
- **Export**: PDF minimale senza dipendenze (canvas → JPEG → PDF), scaricabile offline.
- **Riconoscimento**: recognizer pluggabile (Nessuno / Google Cloud Vision), API key salvata localmente, testo riconosciuto editabile.
- **PWA**: installabile, offline-first, manifest + icone, funziona da sottocartella GitHub Pages.

## Definizione di completamento

- [x] 40+ test automatici verdi (store, ink, undo, recognizer, pdf, questions, App)
- [x] Lint 0 errori/warning · audit 0 vulnerabilità
- [x] Build PWA ok · icone manifest HTTP 200
- [x] Smoke browser: disegno penna reale su canvas, undo, desktop/mobile zero overflow, offline reload ok
- [x] Repository GitHub + Pages HTTPS con CI (test → lint → build → deploy)
- [x] Pacchetti static/source con checksum SHA-256
