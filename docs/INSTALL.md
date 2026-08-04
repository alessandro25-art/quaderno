# Installare Quaderno

## Su iPad (consigliato)

1. Apri Safari sull'URL pubblicato (HTTPS).
2. Tocca **Condividi** → **Aggiungi alla schermata Home**.
3. Apri l'icona: Quaderno funziona a schermo intero, anche offline.

Su Android/Chrome: menu → **Installa app**. Su desktop: icona installazione nella barra indirizzi o Impostazioni → **Installa Quaderno**.

## Dati e backup

- Tutto vive nel browser, legato all'URL/origine.
- **Prima regola**: esporta spesso il backup da Impostazioni (JSON).
- Per cambiare dispositivo: Esporta → apri l'URL sul nuovo → Importa.
- Non cancellare i dati del sito senza aver esportato prima.

## Riconoscimento scrittura (opzionale)

1. Impostazioni → incolla la tua **API key Google Cloud Vision** (Console Google Cloud → Vision API → credenziali).
2. Nella pagina del quaderno, attiva il toggle di riconoscimento (icona a forma di testo).
3. Tocca "Riconosci pagina": il testo compare sotto il foglio, editabile.
4. La chiave resta solo sul dispositivo; l'immagine della pagina viaggia verso Google **solo** quando attivi il riconoscimento.

## Limitazioni note

- PencilKit non è disponibile per le web app: niente riconoscimento on-device in Safari.
- Con browser aperto il disegno è in tempo reale; la pressione/tilt della Pencil dipendono da come Safari li espone al sito (verificare sul proprio iPad).
