import { useCallback, useEffect, useRef, useState } from 'react'
import { createJournalStore } from './data/store.js'
import CoverView from './views/CoverView.jsx'
import NotebookView from './views/NotebookView.jsx'
import ArchiveView from './views/ArchiveView.jsx'
import SettingsView from './views/SettingsView.jsx'
import { registerSW } from 'virtual:pwa-register'

export const VIEWS = { COVER: 'cover', NOTEBOOK: 'notebook', ARCHIVE: 'archive', SETTINGS: 'settings' }

// Accento del giorno: una tinta calda diversa ogni giorno (identità cromatica sottile).
const DAY_PALETTE = ['#b8860b', '#c45a3c', '#6b7b3a', '#8b6914', '#a0523c', '#b87c4b']

export default function App({ store: providedStore } = {}) {
  const [store] = useState(() => providedStore ?? createJournalStore())
  const [view, setView] = useState(VIEWS.COVER)
  const [notebooks, setNotebooks] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [settingsFrom, setSettingsFrom] = useState('notebook')
  const [reminder, setReminder] = useState('off')
  const [jumpDate, setJumpDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [installable, setInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches ?? false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const updateSWRef = useRef(null)

  const refresh = useCallback(async () => {
    const all = await store.listNotebooks()
    setNotebooks(all)
    if (all.length === 0) {
      const now = new Date().toISOString()
      await store.saveNotebook({
        id: crypto.randomUUID(),
        title: 'Diario',
        coverColor: '#6b4f3a',
        paperType: 'kindle',
        createdAt: now,
        updatedAt: now,
      })
      setNotebooks(await store.listNotebooks())
    }
    setLoading(false)
  }, [store])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    function capture(event) {
      event.preventDefault()
      setInstallPrompt(event)
      setInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', capture)
    return () => window.removeEventListener('beforeinstallprompt', capture)
  }, [])

  // Storage persistente: chiede a Safari di non sfrattare i dati (ITP eviction).
  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {})
    }
  }, [])

  // Colore del giorno: accento dinamico (sottile, ma dà identità a ogni giornata).
  useEffect(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const day = Math.floor((now - start) / 86400000)
    document.documentElement.style.setProperty('--accent-soft', DAY_PALETTE[day % DAY_PALETTE.length])
  }, [])

  // Promemoria serale: notifica gentile quando l'app è aperta all'ora scelta.
  useEffect(() => {
    let active = true
    store.getSetting('reminderTime', 'off').then((value) => {
      if (active) setReminder(value)
    })
    return () => { active = false }
  }, [store])

  useEffect(() => {
    if (reminder === 'off') return undefined
    const interval = setInterval(async () => {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      if (hhmm !== reminder) return
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const last = await store.getSetting('lastReminderDate', '')
      if (last === today) return
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Quaderno', { body: 'Hai un momento per scrivere? Anche una riga va bene.' })
      }
      await store.setSetting('lastReminderDate', today)
    }, 30000)
    return () => clearInterval(interval)
  }, [store, reminder])

  // Nuova versione disponibile: il service worker la segnala, l'utente aggiorna quando vuole.
  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true)
      },
      onOfflineReady() {},
    })
    return () => { updateSWRef.current = null }
  }, [])

  function handleUpdate() {
    updateSWRef.current?.(true)
  }

  const current = notebooks.find((notebook) => notebook.id === currentId) ?? null

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const choice = await installPrompt.userChoice
    setInstallable(false)
    if (choice.outcome === 'accepted') setIsStandalone(true)
  }

  if (loading) {
    return <div className="boot-screen"><span className="kicker">QUADERNO</span><h1>Diario a mano</h1></div>
  }

  return (
    <div className="app">
      {updateAvailable && (
        <div className="update-banner" role="status">
          <span>È disponibile una nuova versione di Quaderno.</span>
          <button type="button" onClick={handleUpdate}>Aggiorna ora</button>
        </div>
      )}
      {view === VIEWS.COVER && (
        <CoverView store={store} notebooks={notebooks} onOpen={(id) => { setCurrentId(id); setView(VIEWS.NOTEBOOK) }} onChanged={refresh} />
      )}
      {view === VIEWS.NOTEBOOK && current && (
        <NotebookView
          store={store}
          notebook={current}
          initialDate={jumpDate}
          onBack={() => { refresh(); setView(VIEWS.COVER) }}
          onOpenArchive={() => setView(VIEWS.ARCHIVE)}
          onOpenSettings={() => { setSettingsFrom('notebook'); setView(VIEWS.SETTINGS) }}
        />
      )}
      {view === VIEWS.ARCHIVE && current && (
        <ArchiveView
          store={store}
          notebook={current}
          onBack={() => setView(VIEWS.NOTEBOOK)}
          onOpenSettings={() => { setSettingsFrom('archive'); setView(VIEWS.SETTINGS) }}
          onOpenDay={(date) => { setCurrentId(current.id); setJumpDate(date); setView(VIEWS.NOTEBOOK) }}
        />
      )}
      {view === VIEWS.SETTINGS && (
        <SettingsView
          store={store}
          notebooks={notebooks}
          onNotebooksChanged={refresh}
          onBack={() => setView(settingsFrom === 'archive' ? VIEWS.ARCHIVE : current ? VIEWS.NOTEBOOK : VIEWS.COVER)}
          onInstall={handleInstall}
          installable={installable}
          isStandalone={isStandalone}
        />
      )}
    </div>
  )
}
