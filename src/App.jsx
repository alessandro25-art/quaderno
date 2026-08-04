import { useCallback, useEffect, useState } from 'react'
import { createJournalStore } from './data/store.js'
import CoverView from './views/CoverView.jsx'
import NotebookView from './views/NotebookView.jsx'
import ArchiveView from './views/ArchiveView.jsx'
import SettingsView from './views/SettingsView.jsx'

export const VIEWS = { COVER: 'cover', NOTEBOOK: 'notebook', ARCHIVE: 'archive', SETTINGS: 'settings' }

export default function App({ store: providedStore } = {}) {
  const [store] = useState(() => providedStore ?? createJournalStore())
  const [view, setView] = useState(VIEWS.COVER)
  const [notebooks, setNotebooks] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [jumpDate, setJumpDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [installable, setInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(() => window.matchMedia?.('(display-mode: standalone)').matches ?? false)
  const [installPrompt, setInstallPrompt] = useState(null)

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
          onOpenSettings={() => setView(VIEWS.SETTINGS)}
        />
      )}
      {view === VIEWS.ARCHIVE && current && (
        <ArchiveView
          store={store}
          notebook={current}
          onBack={() => setView(VIEWS.NOTEBOOK)}
          onOpenDay={(date) => { setCurrentId(current.id); setJumpDate(date); setView(VIEWS.NOTEBOOK) }}
        />
      )}
      {view === VIEWS.SETTINGS && (
        <SettingsView
          store={store}
          notebooks={notebooks}
          onNotebooksChanged={refresh}
          onBack={() => setView(current ? VIEWS.NOTEBOOK : VIEWS.COVER)}
          onInstall={handleInstall}
          installable={installable}
          isStandalone={isStandalone}
        />
      )}
    </div>
  )
}
