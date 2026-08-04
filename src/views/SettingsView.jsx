import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Download, Upload, KeyRound, Lock, Paperclip } from 'lucide-react'

export default function SettingsView({ store, notebooks = [], onNotebooksChanged, onBack, onInstall, installable, isStandalone }) {
  const [apiKey, setApiKey] = useState('')
  const [paperType, setPaperType] = useState('kindle')
  const [inkColor, setInkColor] = useState('black')
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    Promise.all([
      store.getSetting('apiKey', ''),
      store.getSetting('paperType', 'kindle'),
      store.getSetting('inkColor', 'black'),
    ]).then(([key, paper, ink]) => {
      if (!active) return
      setApiKey(key)
      setPaperType(paper)
      setInkColor(ink)
    })
    return () => { active = false }
  }, [store])

  async function saveKey(event) {
    event.preventDefault()
    await store.setSetting('apiKey', apiKey.trim())
    setNotice(apiKey.trim() ? 'API key salvata solo su questo dispositivo.' : 'API key rimossa.')
  }

  async function savePreference(key, value) {
    await store.setSetting(key, value)
    setNotice('Preferenza salvata.')
  }

  async function exportBackup() {
    const data = await store.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `quaderno-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Backup scaricato.')
  }

  async function importBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await store.importData(data)
      setNotice('Backup ripristinato: quaderni, pagine e inchiostro sono tornati.')
      window.location.reload()
    } catch (error) {
      setNotice(`Import fallito: ${error.message}`)
    }
  }

  return (
    <div className="settings-view">
      <header className="app-header">
        <button className="ghost-button" type="button" onClick={onBack} aria-label="Torna indietro"><ArrowLeft size={18} /></button>
        <div className="header-title">
          <span className="kicker">IMPOSTAZIONI</span>
          <h1>Il quaderno</h1>
        </div>
      </header>

      <div className="settings-layout">
        <section className="settings-card">
          <h2><Paperclip size={15} /> Pagina e inchiostro</h2>
          <label>
            Foglio predefinito per i nuovi quaderni
            <select value={paperType} onChange={(event) => { setPaperType(event.target.value); savePreference('paperType', event.target.value) }}>
              <option value="kindle">Kindle (e-ink)</option>
              <option value="lined">Righe</option>
              <option value="grid">Quadretti</option>
              <option value="dotted">Puntinato</option>
              <option value="blank">Bianco</option>
            </select>
          </label>
          <label>
            Inchiostro preferito
            <select value={inkColor} onChange={(event) => { setInkColor(event.target.value); savePreference('inkColor', event.target.value) }}>
              <option value="black">Nero</option>
              <option value="blue">Blu</option>
              <option value="green">Verde</option>
              <option value="red">Rosso</option>
            </select>
          </label>
          {notebooks.length > 0 && (
            <div className="notebook-paper-list">
              <span className="settings-help">Foglio dei quaderni esistenti:</span>
              {notebooks.map((notebook) => (
                <label key={notebook.id} className="notebook-paper-row">
                  <span>{notebook.title}</span>
                  <select
                    aria-label={`Foglio di ${notebook.title}`}
                    value={notebook.paperType}
                    onChange={async (event) => {
                      await store.saveNotebook({ ...notebook, paperType: event.target.value })
                      onNotebooksChanged?.()
                    }}
                  >
                    <option value="kindle">Kindle</option>
                    <option value="lined">Righe</option>
                    <option value="grid">Quadretti</option>
                    <option value="dotted">Puntinato</option>
                    <option value="blank">Bianco</option>
                  </select>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="settings-card">
          <h2><KeyRound size={15} /> Riconoscimento scrittura</h2>
          <p className="settings-help">
            Su iPad una web app non può usare il riconoscimento di Apple (PencilKit è solo per app native).
            Quaderno riconosce la tua scrittura inviando la pagina a un servizio cloud <strong>solo quando lo attivi tu</strong>,
            pagina per pagina. La chiave resta solo su questo dispositivo.
          </p>
          <form onSubmit={saveKey}>
            <label>
              API key (Google Cloud Vision)
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Inseriscila quando vuoi"
                aria-label="API key per il riconoscimento"
              />
            </label>
            <button className="primary-button" type="submit">Salva chiave</button>
          </form>
          <p className="settings-help small">
            Gratis fino a 1000 pagine al mese. Senza chiave, Quaderno funziona identico: tutto resta sul dispositivo.
          </p>
        </section>

        <section className="settings-card">
          <h2><Download size={15} /> Backup e portabilità</h2>
          <p className="settings-help">
            I tuoi quaderni vivono solo in questo browser. Esporta spesso un backup: puoi ripristinarlo su qualsiasi dispositivo.
          </p>
          <div className="settings-actions">
            <button className="primary-button" type="button" onClick={exportBackup}><Download size={15} /> Esporta backup</button>
            <button className="ghost-button strong" type="button" onClick={() => fileRef.current?.click()}><Upload size={15} /> Importa backup</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importBackup} aria-label="Importa backup" />
          </div>
        </section>

        <section className="settings-card">
          <h2><Lock size={15} /> Privacy</h2>
          <p className="settings-help">
            Nessun account, nessun server, nessuna telemetria. Le pagine scritte a mano restano in questo browser.
            L'unica eccezione è il riconoscimento: se lo attivi per una pagina, quella immagine viaggia verso il servizio cloud che hai scelto.
          </p>
          {!isStandalone && (
            <button className="primary-button" type="button" onClick={onInstall} disabled={!installable}>
              {installable ? 'Installa Quaderno' : 'Installa dal menu del browser (su iPhone: Condividi → Aggiungi a Home)'}
            </button>
          )}
        </section>
      </div>

      {notice && <div className="notice-bar" role="status">{notice}</div>}
    </div>
  )
}
