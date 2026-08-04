import { useCallback, useEffect, useRef, useState } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Eraser,
  Highlighter, PenLine, Redo2, Settings, Undo2, ZoomIn, ZoomOut, ScanText, FileDown,
} from 'lucide-react'
import InkCanvas from '../components/InkCanvas.jsx'
import { TOOLS, INK_COLORS, PEN_WIDTHS } from '../domain/ink.js'
import { CLOSING_QUESTION, MICROSTEP_PROMPT, SATISFACTION_PROMPT, questionForDate } from '../data/questions.js'
import { createRecognizer } from '../domain/recognizer.js'
import { exportCanvasAsPdf } from '../domain/pdf.js'

const PEN_OPTIONS = [
  { id: 'fine', label: 'Fine', width: PEN_WIDTHS.fine },
  { id: 'medium', label: 'Media', width: PEN_WIDTHS.medium },
  { id: 'thick', label: 'Grossa', width: PEN_WIDTHS.thick },
]

export default function NotebookView({ store, notebook, initialDate = null, onBack, onOpenArchive, onOpenSettings }) {
  const [date, setDate] = useState(() => initialDate ?? format(new Date(), 'yyyy-MM-dd'))
  const [page, setPage] = useState(null)
  const [strokes, setStrokes] = useState([])
  const [tool, setTool] = useState(TOOLS.PEN)
  const [penSize, setPenSize] = useState('medium')
  const [color, setColor] = useState(INK_COLORS.black)
  const [zoom, setZoom] = useState(1)
  const [notice, setNotice] = useState('')
  const [recognizing, setRecognizing] = useState(false)
  const canvasRef = useRef(null)

  const question = questionForDate(date)
  const kindle = notebook.paperType === 'kindle'

  useEffect(() => {
    let active = true
    async function load() {
      const todayPage = await store.createPage({ notebookId: notebook.id, date, paperType: notebook.paperType })
      if (!active) return
      setPage(todayPage)
      const stored = await store.listStrokes(todayPage.id)
      if (active) setStrokes(stored)
    }
    load()
    return () => { active = false }
  }, [store, notebook.id, notebook.paperType, date])

  useEffect(() => {
    function onKeyDown(event) {
      const modifier = event.ctrlKey || event.metaKey
      if (!modifier) return
      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault(); canvasRef.current?.redo()
      } else if (event.key.toLowerCase() === 'z') {
        event.preventDefault(); canvasRef.current?.undo()
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault(); canvasRef.current?.redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const persistStrokes = useCallback(async (next) => {
    setStrokes(next)
    if (!page) return
    await store.db.transaction('rw', store.db.strokes, async () => {
      await store.db.strokes.where('pageId').equals(page.id).delete()
      await store.saveStrokes(next)
    })
  }, [store, page])

  async function setPageEnabled(enabled) {
    if (!page) return
    const updated = { ...page, handwritingEnabled: enabled }
    setPage(updated)
    await store.savePage(updated)
    setNotice(enabled ? 'Riconoscimento attivo per questa pagina.' : 'Riconoscimento spento per questa pagina.')
  }

  async function recognizePage() {
    if (!page || !strokes.length) {
      setNotice('Scrivi qualcosa prima di riconoscere la pagina.')
      return
    }
    const apiKey = (await store.getSetting('apiKey')) || ''
    if (!apiKey) {
      setNotice('Aggiungi prima la tua API key in Impostazioni.')
      return
    }
    setRecognizing(true)
    try {
      const recognizer = createRecognizer(apiKey)
      const text = await recognizer.recognize(strokes, 'it')
      const updated = { ...page, recognizedText: text }
      setPage(updated)
      await store.savePage(updated)
      setNotice(text ? 'Testo riconosciuto: puoi correggerlo qui sotto.' : 'Nessun testo riconosciuto.')
    } catch (error) {
      setNotice(`Riconoscimento fallito: ${error.message}`)
    } finally {
      setRecognizing(false)
    }
  }

  async function exportPdf() {
    const canvas = document.querySelector(`[data-page="${page.id}"] canvas.ink-layer`)
    if (!canvas) return
    try {
      await exportCanvasAsPdf(canvas, `quaderno-${notebook.title.toLowerCase().replace(/\s+/g, '-')}-${date}.pdf`)
      setNotice('PDF scaricato.')
    } catch (error) {
      setNotice(`Export fallito: ${error.message}`)
    }
  }

  function moveDate(delta) {
    setDate((current) => format(addDays(parseISO(current), delta), 'yyyy-MM-dd'))
  }

  const toolOptions = [
    { id: 'pen', label: 'Penna', icon: PenLine, active: tool === TOOLS.PEN },
    { id: 'highlighter', label: 'Evidenziatore', icon: Highlighter, active: tool === TOOLS.HIGHLIGHTER },
    { id: 'eraser', label: 'Gomma', icon: Eraser, active: tool === TOOLS.ERASER },
  ]

  return (
    <div className={`notebook-view ${kindle ? 'kindle' : ''}`}>
      <header className="app-header">
        <button className="ghost-button" type="button" onClick={onBack} aria-label="Torna ai quaderni"><ArrowLeft size={18} /></button>
        <div className="header-title">
          <span className="kicker">QUADERNO</span>
          <h1>{notebook.title}</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={onOpenArchive} aria-label="Archivio"><CalendarDays size={18} /></button>
          <button className="ghost-button" type="button" onClick={onOpenSettings} aria-label="Impostazioni"><Settings size={18} /></button>
        </div>
      </header>

      <div className="page-shell">
        <aside className="spine" aria-hidden="true" />
        <article className={`paper-page ${kindle ? 'kindle' : ''}`} key={page?.id ?? date} data-page={page?.id}>
          <div className="page-head">
            <span className="page-date">{format(parseISO(date), 'EEEE d MMMM yyyy', { locale: it })}</span>
            <span className="page-notebook">{notebook.title}</span>
          </div>

          {question && (
            <div className="question-ticket" role="note">
              <span className="ticket-label">Domanda del giorno</span>
              <p>{question.text}</p>
            </div>
          )}

          <InkCanvas
            key={page?.id ?? date}
            ref={canvasRef}
            strokes={strokes}
            onStrokesChange={persistStrokes}
            tool={tool}
            color={color}
            width={PEN_WIDTHS[penSize] ?? PEN_WIDTHS.medium}
            zoom={zoom}
            paperType={page?.paperType ?? notebook.paperType}
          />

          <div className="page-foot">
            <div className="foot-line"><span className="foot-label">Micro-passo</span><span className="foot-text">{MICROSTEP_PROMPT}</span></div>
            <div className="foot-line"><span className="foot-label">Chiusura</span><span className="foot-text">{CLOSING_QUESTION}</span></div>
            <div className="foot-line"><span className="foot-label">Soddisfazione</span><span className="foot-text">{SATISFACTION_PROMPT}</span></div>
          </div>
        </article>
        <aside className="spine right" aria-hidden="true" />
      </div>

      <div className="page-toolbar">
        <div className="toolbar-group">
          <button className="ghost-button" type="button" onClick={() => moveDate(-1)} aria-label="Giorno precedente"><ChevronLeft size={18} /></button>
          <button className="ghost-button" type="button" onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} aria-label="Torna a oggi">Oggi</button>
          <button className="ghost-button" type="button" onClick={() => moveDate(1)} aria-label="Giorno successivo"><ChevronRight size={18} /></button>
        </div>

        <div className="toolbar-group tools">
          {toolOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`tool-button ${option.active ? 'active' : ''}`}
              aria-label={option.label}
              aria-pressed={option.active}
              onClick={() => setTool(option.id)}
            >
              <option.icon size={18} />
            </button>
          ))}
          {tool === TOOLS.PEN && (
            <>
              <span className="toolbar-separator" aria-hidden="true" />
              {PEN_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`tool-button ${penSize === option.id ? 'active' : ''}`}
                  aria-label={`Penna ${option.label}`}
                  aria-pressed={penSize === option.id}
                  onClick={() => setPenSize(option.id)}
                >
                  <span className="pen-dot" style={{ width: option.width * 3, height: option.width * 3 }} />
                </button>
              ))}
              <span className="toolbar-separator" aria-hidden="true" />
              {Object.entries(INK_COLORS).map(([name, value]) => (
                <button
                  key={name}
                  type="button"
                  className={`color-dot ${color === value ? 'active' : ''}`}
                  aria-label={`Inchiostro ${name}`}
                  aria-pressed={color === value}
                  onClick={() => setColor(value)}
                >
                  <span style={{ background: value }} />
                </button>
              ))}
            </>
          )}
        </div>

        <div className="toolbar-group">
          <button className="ghost-button" type="button" onClick={() => canvasRef.current?.undo()} aria-label="Annulla"><Undo2 size={18} /></button>
          <button className="ghost-button" type="button" onClick={() => canvasRef.current?.redo()} aria-label="Rifai"><Redo2 size={18} /></button>
          <span className="toolbar-separator" aria-hidden="true" />
          <button className="ghost-button" type="button" onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))} aria-label="Riduci zoom"><ZoomOut size={18} /></button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="ghost-button" type="button" onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))} aria-label="Aumenta zoom"><ZoomIn size={18} /></button>
          <span className="toolbar-separator" aria-hidden="true" />
          <button className={`ghost-button ${page?.handwritingEnabled ? 'active' : ''}`} type="button" onClick={() => setPageEnabled(!page?.handwritingEnabled)} aria-label="Attiva riconoscimento scrittura" aria-pressed={page?.handwritingEnabled}><ScanText size={18} /></button>
          <button className="ghost-button" type="button" onClick={exportPdf} aria-label="Esporta pagina in PDF"><FileDown size={18} /></button>
        </div>
      </div>

      {page?.handwritingEnabled && (
        <div className="ocr-panel">
          <div className="ocr-head">
            <strong>Riconoscimento scrittura</strong>
            <button className="primary-button" type="button" onClick={recognizePage} disabled={recognizing}>
              {recognizing ? 'Riconoscendo…' : 'Riconosci pagina'}
            </button>
          </div>
          <textarea
            aria-label="Testo riconosciuto"
            rows="4"
            placeholder="Il testo riconosciuto apparirà qui; puoi correggerlo a mano."
            value={page.recognizedText ?? ''}
            onChange={(event) => {
              const updated = { ...page, recognizedText: event.target.value }
              setPage(updated)
              store.savePage(updated)
            }}
          />
        </div>
      )}

      {notice && <div className="notice-bar" role="status">{notice}</div>}
    </div>
  )
}
